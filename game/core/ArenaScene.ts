import * as Phaser from 'phaser';
import { ARENA } from '../data/arena';
import { createRandomPackage, chooseOrTimeout, PackageOption } from './packageSystem';
import { applyEffectMultiplier } from './effects';
import { materialColor, playBeep } from './feedback';

type Fighter = Phaser.Physics.Arcade.Image & {
  hp: number;
  score: number;
  id: string;
  respawnAt: number;
};

export class ArenaScene extends Phaser.Scene {
  private player!: Fighter;
  private bot!: Fighter;
  private cursors!: { [key: string]: Phaser.Input.Keyboard.Key };
  private package: readonly [PackageOption, PackageOption] = createRandomPackage();
  private selected = 0;
  private hud!: Phaser.GameObjects.Text;
  private endAt = 0;
  private crate!: Phaser.Physics.Arcade.Image;
  private packageDeadline = 0;
  private packageChoice: 0 | 1 | null = null;
  private packageOverlay!: Phaser.GameObjects.Container;
  private playerFlashUntil = 0;

  constructor() { super('ArenaScene'); }

  create() {
    this.physics.world.setBounds(0, 0, ARENA.width, ARENA.height);
    this.cameras.main.setBackgroundColor('#111827');
    this.add.rectangle(ARENA.width / 2, ARENA.height / 2, ARENA.width - 40, ARENA.height - 40, 0x1f2937).setStrokeStyle(4, 0xf97316);
    this.add.text(16, 16, ARENA.name, { color: '#f59e0b', fontSize: '24px' });

    const p = ARENA.respawnPoints[0];
    const b = ARENA.respawnPoints[1];
    this.player = this.makeFighter('player', p.x, p.y, 0x22c55e);
    this.bot = this.makeFighter('bot', b.x, b.y, 0xef4444);

    this.cursors = this.input.keyboard!.addKeys('W,A,S,D,SPACE,ONE,TWO,E,R') as { [key: string]: Phaser.Input.Keyboard.Key };
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.throwObject(this.player, pointer.worldX, pointer.worldY));

    this.hud = this.add.text(16, 52, '', { color: '#e4e4e7', fontSize: '16px' });

    this.crate = this.physics.add.image(ARENA.width / 2, ARENA.height / 2, '__WHITE');
    this.crate.setDisplaySize(30, 30);
    this.crate.setTint(0xfacc15);
    this.crate.setImmovable(true);
    this.physics.add.overlap(this.player, this.crate, () => this.openPackage());

    this.packageOverlay = this.add.container(40, ARENA.height - 170);
    const bg = this.add.rectangle(0, 0, 560, 140, 0x0b1220, 0.9).setOrigin(0, 0).setStrokeStyle(2, 0xf97316);
    const title = this.add.text(12, 8, 'CASSA ROBACCIA // Etichette Industriali', { fontSize: '14px', color: '#facc15' });
    const body = this.add.text(12, 34, '', { fontSize: '14px', color: '#e4e4e7' }).setName('body');
    this.packageOverlay.add([bg, title, body]);
    this.packageOverlay.setVisible(false);
    playBeep(this, 'pick');

    this.endAt = this.time.now + 120000;

    this.time.addEvent({ delay: 350, loop: true, callback: () => this.botBrain() });
  }

  update() {
    const speed = 200;
    this.player.setVelocity(0, 0);
    if (this.cursors.A.isDown) this.player.setVelocityX(-speed);
    if (this.cursors.D.isDown) this.player.setVelocityX(speed);
    if (this.cursors.W.isDown) this.player.setVelocityY(-speed);
    if (this.cursors.S.isDown) this.player.setVelocityY(speed);
    if (Phaser.Input.Keyboard.JustDown(this.cursors.ONE)) this.selected = 0;
    if (Phaser.Input.Keyboard.JustDown(this.cursors.TWO)) this.selected = 1;
    if (Phaser.Input.Keyboard.JustDown(this.cursors.SPACE)) this.throwObject(this.player, this.bot.x, this.bot.y);
    if (Phaser.Input.Keyboard.JustDown(this.cursors.E)) this.tryChoosePackage(0);
    if (Phaser.Input.Keyboard.JustDown(this.cursors.R)) this.tryChoosePackage(1);

    this.checkRespawn(this.player);
    this.checkRespawn(this.bot);
    const remaining = Math.max(0, Math.ceil((this.endAt - this.time.now) / 1000));
    this.player.setTint(this.time.now < this.playerFlashUntil ? 0xfca5a5 : 0x22c55e);
    this.hud.setText(`HP P:${this.player.hp} B:${this.bot.hp} | Score P:${this.player.score} B:${this.bot.score} | ${remaining}s\nEquip: ${this.package[this.selected].name} | Cassa: E/R`);
    this.checkPackageTimeout();

    if (remaining <= 0) {
      this.scene.pause();
      const winner = this.player.score === this.bot.score ? 'Pareggio' : this.player.score > this.bot.score ? 'Vittoria!' : 'Sconfitta';
      this.add.rectangle(ARENA.width / 2, ARENA.height / 2, 700, 220, 0x09090b, 0.95).setStrokeStyle(3, 0xf97316);
      this.add.text(ARENA.width / 2 - 260, ARENA.height / 2 - 60, `Fine partita: ${winner}`, { fontSize: '42px', color: '#f97316' });
      this.add.text(ARENA.width / 2 - 260, ARENA.height / 2 + 10, `Punteggio finale ${this.player.score} - ${this.bot.score}`, { fontSize: '28px', color: '#e4e4e7' });
    }
  }

  private makeFighter(id: string, x: number, y: number, color: number) {
    const base = this.physics.add.image(x, y, '__WHITE');
    base.setDisplaySize(36, 36);
    base.setTint(color);
    base.setCollideWorldBounds(true);
    base.setDrag(500, 500);
    const shadow = this.add.ellipse(x, y + 20, 34, 12, 0x000000, 0.28);
    this.events.on('update', () => shadow.setPosition(base.x, base.y + 20));
    const fighter = base as Fighter;
    fighter.hp = 100;
    fighter.score = 0;
    fighter.id = id;
    fighter.respawnAt = 0;
    return fighter;
  }

  private throwObject(attacker: Fighter, tx: number, ty: number) {
    if (attacker.respawnAt > this.time.now) return;
    const charge = this.add.rectangle(attacker.x, attacker.y - 26, 0, 6, 0xf97316).setOrigin(0.5, 0.5);
    this.tweens.add({ targets: charge, width: 26, duration: 80, yoyo: false });
    const obj = attacker.id === 'player' ? this.package[this.selected] : createRandomPackage()[Math.floor(Math.random() * 2)];
    const proj = this.physics.add.image(attacker.x, attacker.y, '__WHITE');
    const projShadow = this.add.ellipse(attacker.x, attacker.y + 10, 14, 6, 0x000000, 0.25);
    this.events.on('update', () => projShadow.active && projShadow.setPosition(proj.x, proj.y + 10));
    proj.setDisplaySize(14, 14);
    proj.setTint(0xf59e0b);
    const angle = Phaser.Math.Angle.Between(attacker.x, attacker.y, tx, ty);
    proj.setVelocity(Math.cos(angle) * obj.speed, Math.sin(angle) * obj.speed);
    playBeep(this, 'throw');
    this.tweens.add({ targets: proj, angle: 360, duration: 400, repeat: -1 });
    const trail = this.add.particles(0, 0, '__WHITE', {
      lifespan: 240,
      speed: { min: 8, max: 24 },
      scale: { start: 0.25, end: 0 },
      quantity: 1,
      tint: materialColor(obj.effect),
      follow: proj,
    });

    this.time.delayedCall(1200, () => { proj.destroy(); projShadow.destroy(); trail.destroy(); charge.destroy(); });
    const target = attacker.id === 'player' ? this.bot : this.player;
    this.physics.add.overlap(proj, target, () => {
      const fx = applyEffectMultiplier(obj);
      const heavyImpact = obj.effect === 'heavy' || obj.damage >= 18;
      const dmg = Math.round(obj.damage * fx.damage);
      const kb = obj.knockback * fx.knockback;
      target.hp -= dmg;
      const knock = Phaser.Math.Angle.Between(attacker.x, attacker.y, target.x, target.y);
      const targetBody = target.body as Phaser.Physics.Arcade.Body | null;
      if (targetBody) {
        targetBody.velocity.x += Math.cos(knock) * kb;
        targetBody.velocity.y += Math.sin(knock) * kb;
      }
      if (obj.effect === 'bounce') {
        this.tweens.add({ targets: proj, alpha: 0.8, duration: 70, yoyo: true });
      }
      if (heavyImpact) {
        this.cameras.main.shake(90, 0.0022);
        this.physics.world.pause();
        this.time.delayedCall(70, () => this.physics.world.resume());
      }
      if (target.id === 'player') {
        this.playerFlashUntil = this.time.now + 140;
      }
      this.spawnImpactFx(target.x, target.y, obj.effect);
      playBeep(this, 'impact');
      proj.destroy();
      if (target.hp <= 0) this.onKO(attacker, target);
    });
  }

  private onKO(attacker: Fighter, target: Fighter) {
    attacker.score += 1;
    target.hp = 0;
    target.setVisible(false);
    const targetBody = target.body as Phaser.Physics.Arcade.Body | null;
    if (targetBody) targetBody.enable = false;
    target.respawnAt = this.time.now + 2200;
    playBeep(this, 'ko');
  }

  private checkRespawn(f: Fighter) {
    const fighterBody = f.body as Phaser.Physics.Arcade.Body | null;
    if (f.respawnAt && f.respawnAt <= this.time.now && fighterBody && !fighterBody.enable) {
      const point = Phaser.Utils.Array.GetRandom(ARENA.respawnPoints);
      f.setPosition(point.x, point.y);
      f.hp = 100;
      fighterBody.enable = true;
      f.setVisible(true);
      f.respawnAt = 0;
    }
  }

  private botBrain() {
    if (this.bot.respawnAt > this.time.now) return;
    this.physics.moveToObject(this.bot, this.player, 140);
    this.throwObject(this.bot, this.player.x + Phaser.Math.Between(-40, 40), this.player.y + Phaser.Math.Between(-40, 40));
  }

  private openPackage() {
    if (this.packageOverlay.visible) return;
    this.package = createRandomPackage();
    this.packageChoice = null;
    this.packageDeadline = this.time.now + 3000;
    const body = this.packageOverlay.getByName('body') as Phaser.GameObjects.Text;
    body.setText(`[E] ${this.package[0].name} (${this.package[0].rarity}/${this.package[0].functionType})\n[R] ${this.package[1].name} (${this.package[1].rarity}/${this.package[1].functionType})\nScadenza: 3 secondi`);
    this.packageOverlay.setVisible(true);
    this.crate.setVisible(false);
    const crateBody = this.crate.body as Phaser.Physics.Arcade.Body | null;
    if (crateBody) crateBody.enable = false;
  }

  private tryChoosePackage(choice: 0 | 1) {
    if (!this.packageOverlay.visible) return;
    this.packageChoice = choice;
    this.assignPackageChoice();
  }

  private checkPackageTimeout() {
    if (!this.packageOverlay.visible) return;
    if (this.time.now >= this.packageDeadline) this.assignPackageChoice();
  }

  private assignPackageChoice() {
    const picked = chooseOrTimeout(this.package, this.packageChoice);
    this.selected = this.package[0].id === picked.id ? 0 : 1;
    this.packageOverlay.setVisible(false);
    playBeep(this, 'pick');
    this.time.delayedCall(5000, () => {
      const point = Phaser.Utils.Array.GetRandom(ARENA.respawnPoints);
      this.crate.setPosition(point.x + Phaser.Math.Between(-90, 90), point.y + Phaser.Math.Between(-90, 90));
      this.crate.setVisible(true);
      const crateBody = this.crate.body as Phaser.Physics.Arcade.Body | null;
      if (crateBody) crateBody.enable = true;
    });
  }


  private spawnImpactFx(x: number, y: number, effect: string) {
    const colors: Record<string, number> = {
      heavy: 0x94a3b8,
      bounce: 0xcbd5e1,
      trap: 0xf5e6b3,
      area: 0xb0f2ff,
      disturb: 0xe4c1ff,
      chaos: 0x7dd3fc,
      direct: 0xfde68a,
    };
    const particles = this.add.particles(x, y, '__WHITE', {
      lifespan: 220,
      speed: { min: 20, max: 120 },
      scale: { start: 0.5, end: 0 },
      quantity: 14,
      tint: colors[effect] ?? 0xffffff,
      emitting: false,
    });
    particles.explode(14, x, y);
    this.time.delayedCall(260, () => particles.destroy());
  }

}
