import * as Phaser from 'phaser';
import { ARENA } from '../data/arena';
import { getRandomPackage, ThrowableObject } from '../data/objects';
import { applyEffectMultiplier } from './effects';

type Fighter = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody & { hp: number; score: number; id: string; respawnAt: number };

export class ArenaScene extends Phaser.Scene {
  private player!: Fighter;
  private bot!: Fighter;
  private cursors!: { [key: string]: Phaser.Input.Keyboard.Key };
  private package: readonly [ThrowableObject, ThrowableObject] = getRandomPackage();
  private selected = 0;
  private hud!: Phaser.GameObjects.Text;
  private endAt = 0;

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

    this.cursors = this.input.keyboard!.addKeys('W,A,S,D,SPACE,ONE,TWO') as { [key: string]: Phaser.Input.Keyboard.Key };
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.throwObject(this.player, pointer.worldX, pointer.worldY));

    this.hud = this.add.text(16, 52, '', { color: '#e4e4e7', fontSize: '16px' });
    this.endAt = this.time.now + 120000;

    this.time.addEvent({ delay: 350, loop: true, callback: () => this.botBrain() });
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.refreshPackage() });
  }

  update() {
    const speed = 200;
    this.player.setVelocity(0);
    if (this.cursors.A.isDown) this.player.setVelocityX(-speed);
    if (this.cursors.D.isDown) this.player.setVelocityX(speed);
    if (this.cursors.W.isDown) this.player.setVelocityY(-speed);
    if (this.cursors.S.isDown) this.player.setVelocityY(speed);
    if (Phaser.Input.Keyboard.JustDown(this.cursors.ONE)) this.selected = 0;
    if (Phaser.Input.Keyboard.JustDown(this.cursors.TWO)) this.selected = 1;
    if (Phaser.Input.Keyboard.JustDown(this.cursors.SPACE)) this.throwObject(this.player, this.bot.x, this.bot.y);

    this.checkRespawn(this.player);
    this.checkRespawn(this.bot);
    const remaining = Math.max(0, Math.ceil((this.endAt - this.time.now) / 1000));
    this.hud.setText(`HP P:${this.player.hp} B:${this.bot.hp} | Score P:${this.player.score} B:${this.bot.score} | ${remaining}s\nPacchetto: [1] ${this.package[0].name} / [2] ${this.package[1].name}`);

    if (remaining <= 0) {
      this.scene.pause();
      const winner = this.player.score === this.bot.score ? 'Pareggio' : this.player.score > this.bot.score ? 'Vittoria!' : 'Sconfitta';
      this.add.rectangle(ARENA.width / 2, ARENA.height / 2, 700, 220, 0x09090b, 0.95).setStrokeStyle(3, 0xf97316);
      this.add.text(ARENA.width / 2 - 260, ARENA.height / 2 - 60, `Fine partita: ${winner}`, { fontSize: '42px', color: '#f97316' });
      this.add.text(ARENA.width / 2 - 260, ARENA.height / 2 + 10, `Punteggio finale ${this.player.score} - ${this.bot.score}`, { fontSize: '28px', color: '#e4e4e7' });
    }
  }

  private makeFighter(id: string, x: number, y: number, color: number) {
    const s = this.add.rectangle(x, y, 36, 36, color);
    this.physics.add.existing(s);
    const body = s as unknown as Fighter;
    body.setCollideWorldBounds(true);
    body.hp = 100; body.score = 0; body.id = id; body.respawnAt = 0;
    return body;
  }

  private throwObject(attacker: Fighter, tx: number, ty: number) {
    if (attacker.respawnAt > this.time.now) return;
    const obj = attacker.id === 'player' ? this.package[this.selected] : getRandomPackage()[Math.floor(Math.random() * 2)];
    const p = this.add.circle(attacker.x, attacker.y, 8, 0xf59e0b);
    this.physics.add.existing(p);
    const proj = p as Phaser.GameObjects.Arc;
    const body = proj.body as Phaser.Physics.Arcade.Body;
    const angle = Phaser.Math.Angle.Between(attacker.x, attacker.y, tx, ty);
    body.setVelocity(Math.cos(angle) * obj.speed, Math.sin(angle) * obj.speed);

    this.time.delayedCall(1200, () => proj.destroy());
    const target = attacker.id === 'player' ? this.bot : this.player;
    this.physics.add.overlap(proj, target, () => {
      const fx = applyEffectMultiplier(obj);
      const dmg = Math.round(obj.damage * fx.damage);
      const kb = obj.knockback * fx.knockback;
      target.hp -= dmg;
      const knock = Phaser.Math.Angle.Between(attacker.x, attacker.y, target.x, target.y);
      target.body.velocity.x += Math.cos(knock) * kb;
      target.body.velocity.y += Math.sin(knock) * kb;
      proj.destroy();
      if (target.hp <= 0) this.onKO(attacker, target);
    });
  }

  private onKO(attacker: Fighter, target: Fighter) {
    attacker.score += 1;
    target.hp = 0;
    target.setVisible(false);
    target.body.enable = false;
    target.respawnAt = this.time.now + 2200;
  }

  private checkRespawn(f: Fighter) {
    if (f.respawnAt && f.respawnAt <= this.time.now && !f.body.enable) {
      const point = Phaser.Utils.Array.GetRandom(ARENA.respawnPoints);
      f.setPosition(point.x, point.y);
      f.hp = 100;
      f.body.enable = true;
      f.setVisible(true);
      f.respawnAt = 0;
    }
  }

  private botBrain() {
    if (this.bot.respawnAt > this.time.now) return;
    this.physics.moveToObject(this.bot, this.player, 140);
    this.throwObject(this.bot, this.player.x + Phaser.Math.Between(-40, 40), this.player.y + Phaser.Math.Between(-40, 40));
  }

  private refreshPackage() {
    this.package = getRandomPackage();
  }
}
