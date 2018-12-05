/*
 * sprites_effects.js
 * So in quintus, sprites are like gamemaker objects.
 * This js has all the effects and projectiles in the game
 */

var loadSpritesC = function() {

	// BOOLET
	Q.Sprite.extend("Boolet", {
		init: function(p) {
			this._super(p, {
				w: 4,
				h: 4,
				type: 0,
				collisionMask: 0 | 102,
				gravity: 0,
				maxX: Q.stage()._collisionLayers[
					0].p.w,
				maxY: Q.stage()._collisionLayers[
					0].p.h
			});
			this.on("hit", this, "collision");
			this.add("2d");
		},
		step: function(dt) {
			if (this.p.x > this.p.maxX ||
				this.p.x < 0 || this.p.y > this
				.p.maxY || this.p.y < 0) {
				this.destroy();
			}
		},
		collision: function(col) {
			if (col.obj.isA("SpartanBelle")) {
				col.obj.gib(arrayRand(deathMsgs
					.killer));
				this.stage.insert(new Q.BonusDucks({
					x: col.obj.p.x,
					y: col.obj.p.y - 30,
					text: "CRITICAL HIT"
				}));
				Q.audio.play("crit.ogg");
			}
			this.destroy();
		},
		draw: function(ctx) {
			styleRandomColor(ctx);
			ctx.fillRect(-3, -3, 6, 6);
		}
	});

	// Bit
	Q.Sprite.extend("Cash", {
		init: function(p) {
			this._super(p, {
				asset: "bit.png",
				cx: 32,
				cy: 32,
				scale: 2,
				type: 6,
				collisionMask: 1,
				gravity: 18,
				stopit: false,
				red: 0
			});
			this.add("2d");
			this.on("bump.bottom", this,
				"collision");
			//this.gravity = 0.1;
			//this.add('2d, platformerControls');
		},
		draw: function(ctx) {
			ctx.drawImage(Q.asset(this.p.asset), -this.p.cx, -this.p.cy);
			ctx.save();
			ctx.setTransform(1, 0, 0, 1, 0,
					0);
			ctx.fillStyle =
				"rgba(255, 0, 0, " + this.p.red + ")";
			ctx.fillRect(0, 0, 800, 600);
			ctx.restore();
		},
		step: function(dt) {
			this.p.x = this.p.horse.p.x
			if (this.p.y > 1000 || this.p.stopit) {
				this.p.y = -200;
				this.p.vy = 0;
			}
			this.p.red = Math.max(0, this.p.red - dt * 4);
			port.viewport.scale = 1 + Math.random() / 3 * this.p.red;
			if (port.viewport.x != 0)
				port.viewport.x = 1592 + Math.random() / 3 * 800 * this.p.red;
		},
		collision: function(col) {
			horseProg.hits ++;
			Q.audio.play("proghit.ogg");
			this.p.red += 0.5;
			this.p.vy = -3000;
			this.p.horse.blood();
			this.p.horse.p.y = 493;
			this.p.horse.p.syncstate = 4;
			horseProg.hit(this.p);
			this.stage.insert(new Q.BonusDucks({
				x: this.p.x,
				y: this.p.y + 50,
				text: "$5"
			}));
		}
	});

	// Lazor
	Q.Sprite.extend("SHOOP", {
		init: function(p) {
			this._super(p, {
				sprite: "woop",
				sheet: "exterminate",
				points: [
					[-2, -2],
					[102, -2],
					[102, 2],
					[-2, 2]
				],
				dead: false,
				cx: 16,
				cy: 16,
				type: 6,
				collisionMask: 1,
				flying: false,
				horse: null,
				gravity: 0,
				maxX: Q.stage()._collisionLayers[
					0].p.w,
				maxY: Q.stage()._collisionLayers[
					0].p.h
			});
			this.add("2d, animation");
			this.on("hit", this, "collision");
			this.play("shoot");
			this.on("shot", this, "fly");
			this.on("boom", this, "hit");
		},
		hit: function() {
			this.destroy();
		},
		fly: function() {
			this.p.flying = true;
			this.play("norm");
		},
		step: function(dt) {
			if (this.p.x > this.p.maxX ||
				this.p.x < 0 || this.p.y > this
				.p.maxY || this.p.y < 0) {
				this.destroy();
			}
			if (this.p.type != 0)
				if (this.p.flying) {
					this.p.vx = Math.cos(this.p.angle /
						57.295) * 800;
					this.p.vy = Math.sin(this.p.angle /
						57.295) * 800;
				} else {
					if (this.p.horse.p.left)
						this.p.angle = this.p.horse.p
						.angle - 180;
					else
						this.p.angle = this.p.horse.p
						.angle;

					if (this.p.horse.p.dualfire)
						this.p.angle = this.p.horse.p
						.angle - (180 * (Math.random() < 0.5));


					this.p.x = this.p.horse.p.x +
						Math.cos(this.p.angle /
							57.295) * 36;
					this.p.y = this.p.horse.p.y +
						Math.sin(this.p.angle /
							57.295) * 36;
				}
		},
		collision: function(col) {
			if (!this.p.dead) {
				this.p.dead = true;
				this.play("hit");
				Q.audio.play("laserhit.ogg");
				this.p.vx = 0;
				this.p.vy = 0;
				this.p.type = 0;
				this.p.collisionMask = 0;
				this.p.x += Math.cos(this.p.angle /
					57.295) * 99;
				this.p.y += Math.sin(this.p.angle /
					57.295) * 99;
				this.p.angle -= 180;
				this.stage.insert(new Q.Explosion({
					x: this.p.x + Math.cos(this.p.angle / 57.295),
					y: this.p.y + Math.sin(this.p.angle / 57.295),
					scale: 0.3,
					angle: (Math.random() - 0.5) * 90
				}));
			}
			if (col.obj.kill)
				col.obj.kill();
		},
		draw: function(ctx) {
			// Draw as light
			darken += this.p.frame / 60;
			ctx.globalCompositeOperation =
				"lighter";
			this.sheet().draw(ctx, -this.p.cx, -
				this.p.cy, this.p.frame);
			ctx.globalCompositeOperation =
				"source-over";
		}
	});

	// GIBS
	Q.Sprite.extend("MoreBlood", {
		init: function(p) {
			this._super(p, {
				sheet: "gibs",
				cx: 32,
				cy: 32,
				collisionMask: 0,
				type: 0
			});
			this.add("2d");
			//this.gravity = 0.1;
			//this.add('2d, platformerControls');
		},
		step: function(dt) {
			this.p.angle += this.p.av * dt * 50;
			if (this.p.x > this.p.maxX ||
				this.p.x < 0 || this.p.y > this
				.p.maxY)
				this.destroy()
		}
	});

	// Text
	Q.Sprite.extend("BonusDucks", {
		init: function(p) {
			this._super(p, {
				collisionMask: 0,
				type: 0,
				text: "",
				time: 0,
				w: 50,
				h: 50
			});
		},
		step: function(dt) {
			this.p.y -= dt * 50;
			if (this.p.time > 0.4) {
				this.destroy();
			}
			this.p.time += dt;
		},
		draw: function(ctx) {
			styleRandomColor(ctx);
			ctx.textAlign = "center";
			ctx.font =
				"16px 'Press Start 2P'";
			ctx.fillText(this.p.text, 0, 0);
		}
	});

	// Explosion
	Q.Sprite.extend("Explosion", {
		init: function(p) {
			this._super(p, {
				sheet: "boom",
				sprite: "explode",
				cx: 100,
				cy: 170,
				collisionMask: 0,
				scale: 1.2,
				gravity: 0,
				type: 0
			});
			this.add("2d, animation");
			this.play("boom");
			this.on("destroy", this, "eggs");
			//this.gravity = 0.1;
			//this.add('2d, platformerControls');
		},
		eggs: function() {
			this.destroy();
		},
		draw: function(ctx) {
			// Draw as light
			darken += 0.06;
			ctx.globalCompositeOperation =
				"lighter";
			this.sheet().draw(ctx, -this.p.cx, -
				this.p.cy, this.p.frame);
			ctx.globalCompositeOperation =
				"source-over";
		}
	});

	// Fire
	Q.Sprite.extend("Fireflare", {
		init: function(p) {
			this._super(p, {
				sheet: "noparticleflame",
				sprite: "flame",
				cx: 128,
				cy: 128,
				collisionMask: 0,
				gravity: 0,
				type: 0
			});
			this.add("2d, animation");
			this.play("boom");
			//this.gravity = 0.1;
			//this.add('2d, platformerControls');
		},
		draw: function(ctx) {
			// Draw as light
			//darken += 0.1;
			ctx.globalCompositeOperation =
				"lighter";
			this.sheet().draw(ctx, -this.p.cx, -
				this.p.cy, this.p.frame);
			ctx.globalCompositeOperation =
				"source-over";
		}
	});

	// Splash
	Q.Sprite.extend("Splash", {
		init: function(p) {
			this._super(p, {
				sheet: "water",
				sprite: "splash",
				cx: 8,
				cy: 8,
				collisionMask: 0,
				scale: 4,
				gravity: 0,
				type: 0
			});
			this.add("2d, animation");
			this.play("boom");
			this.on("destroy", this, "eggs");
			Q.audio.play("splash.ogg");
			//this.gravity = 0.1;
			//this.add('2d, platformerControls');
		},
		eggs: function() {
			this.destroy();
		}
	});

	Q.Sprite.extend("Bang", {
		init: function(p) {
			this._super(p, {
				asset: "boolet.png",
				cx: 25,
				cy: 7,
				collisionMask: 125 | 138,
				flying: false,
				horse: null,
				gravity: 0,
			});
			this.add("2d");
			this.on("hit", this, "collision");
			this.on("shot", this, "fly");
		},
		step: function(dt) {
			if (this.p.x > 800 || this.p.x <
				0 || this.p.y > 600 || this.p.y <
				0) {
				this.destroy();
			}
			if (this.p.y > 500) {
				this.stage.insert(new Q.Splash({
					x: this.p.x,
					y: 500,
					vx: -1000
				}));
				this.destroy();
			}
		},
		collision: function(col) {
			if (col.obj.isA("FlyingFag")) {
				var damage = Math.floor(Math.random() *
					1000) / 100000
				this.stage.insert(new Q.BonusDucks({
					x: col.obj.p.x,
					y: col.obj.p.y - 60,
					text: "-" + damage
				}));
				col.obj.p.health = Math.floor((
						col.obj.p.health - damage) *
					1000000) / 1000000;
				Q.audio.play("bullhit.ogg");
				col.obj.blood();
				this.stage.boomB = Math.max(5, this.stage.boomB);
				this.destroy();
			} else if (col.obj.isA("Brick")) {
				col.obj.p.vx += Math.cos(this.p.angle /
					57.29577) * 150;
				col.obj.p.yx += Math.sin(this.p.angle /
					57.29577) * 150;
				col.obj.p.spin += 5 * (Math.random() -
					0.5);
				Q.audio.play("bullhit.ogg");
				this.destroy();
			}
			//if (!col.obj.isA("Tawdis"))
				
			if (col.obj.kill)
				col.obj.kill();
			//this.p.destroy();
		},
		draw: function(ctx) {
			// Draw as light
			ctx.globalCompositeOperation =
				"lighter";
			ctx.drawImage(Q.asset(this.p.asset), -
				this.p.cx, -this.p.cy);
			ctx.globalCompositeOperation =
				"source-over";
		}
	});

	// BRICKS
	Q.Sprite.extend("Brick", {
		init: function(p) {
			this._super(p, {
				asset: "brick.png",
				cx: 16,
				cy: 9,
				spin: (Math.random() - 0.5) *
					3,
				scale: 1,
				gravity: 0.07,
				angle: Math.random() * 360,
				type: 138,
				collisionMask: 0
			});
			this.add("2d");
		},
		step: function(dt) {
			if (this.p.x < 0 || this.p.y >
				600) {
				this.destroy();
			}
			this.p.angle += this.p.spin * dt *
				1000;
			this.p.vx -= dt * 120;
			var near = Q("FlyingFag").first();
			if (Math.sqrt(Math.pow((near.p.x -
					this.p.x), 2) + Math.pow((
					near.p.y - this.p.y), 2)) < 64 &&
				this.p.vx > 0) {
				Q.audio.play("butthurt.ogg");
				near.p.health -= 8;
				near.lotzofblood();
				Q.audio.play("crit.ogg");
				this.stage.insert(new Q.BonusDucks({
					x: near.p.x,
					y: near.p.y - 60,
					text: "CRITICAL HIT"
				}));
				this.stage.boomB = 30;
				this.destroy();
			}
			if (this.stage.stopeverything)
				this.destroy();
			if (this.p.y > 500) {
				this.stage.insert(new Q.Splash({
					x: this.p.x,
					y: 500,
					vx: -1000
				}));
				this.destroy();
			}
		}
	});


}
