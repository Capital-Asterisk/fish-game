/*
 * sprites_environment.js
 * So in quintus, sprites are like gamemaker objects.
 * This js has all the sprites in the game
 */

var loadSpritesB = function() {

	// Bucket
	Q.Sprite.extend("TheBucket", {
		init: function(p) {
			this._super(p, {
				disable: false,
				asset: "bucket.png",
				cx: 24,
				cy: 24,
				collisionMask: 1 | 6
			});
			this.add("2d");
			this.on("bump.top", this,
				"collision");
			//this.gravity = 0.1;
			//this.add('2d, platformerControls');
		},
		collision: function(col) {

			if (col.obj.isA("TheFish") && !this.p.disable) {
				this.p.disable = true;
				Q.audio.stop();
				Q.audio.play("bucket.ogg");
				console.log("nice job");
				col.obj.destroy();
				this.stage.insert(new Q.EndLevel({
					horse: this
				}));
				if (Math.random() < 0.6) {
					this.stage.insert(new Q.BonusDucks({
						x: this.p.x,
						y: this.p.y - 30,
						text: "CRITICAL HIT"
					}));
					Q.audio.play("crit.ogg");
				}
			}
		}
	});

	// Checkpoint
	Q.Sprite.extend("Commipoint", {
		init: function(p) {
			this._super(p, {
				sheet: "commipoint",
				cx: 8,
				cy: 32,
				scale: 3,
				sine: 0,
				text: ["C", "H", "E", "C", "K", "P", "O", "I", "N", "T"]
			});
			this.add("2d");
			this.on("hit", this,
				"collision");
			//this.gravity = 0.1;
			//this.add('2d, platformerControls');
		},
		step: function(dt) {
			this.p.sine += dt * 2;
		},
		collision: function(col) {
			if (this.p.frame == 0 && (col.obj.isA("AdorableHorse") || col.obj.isA("SpartanBelle") || col.obj.isA("TheFish"))) {
				this.p.frame = 1;
				if (Math.random() < 0.7)
					Q.audio.play("checkpoint.ogg");
				else
					Q.audio.play("vndlgr.ogg");
				checkpoint = Q("Commipoint").items.indexOf(this);
				if (Math.random() < 0.4) {
					Q.audio.play("crit.ogg");
					this.stage.insert(new Q.BonusDucks({
						x: this.p.x,
						y: this.p.y - 90,
						text: "CRITICAL HIT"
					}));
				}
			}
		},
		draw: function(ctx) {
			this.sheet().draw(ctx, -this.p.cx, -
				this.p.cy, this.p.frame);
			if (this.p.frame == 1) {
				ctx.globalCompositeOperation =
					"lighter";
				this.sheet().draw(ctx, -this.p.cx, -
					this.p.cy, 2);
				ctx.globalCompositeOperation =
					"source-over";
			}

			ctx.font = "8px 'Press Start 2P'";
			ctx.fillStyle = "rgb(255, 255, 255)";

			for (var i = 0; i < this.p.text.length; i++) {
				ctx.fillText(this.p.text[i], -40 + i * 8, -50 + 4 * Math.sin(this.p.sine + 0.8 * i));
			}
		}
	});

	// Bird
	Q.Sprite.extend("Bird", {
		init: function(p) {
			this._super(p, {
				sheet: "exitbird",
				cx: 16,
				cy: -16,
				gravity: 0,
				type: 0,
				collisionMask: 0
			});
			this.gravity = 0.1;
			//this.add('2d, platformerControls');
		},
		step: function(dt) {
			var belle = Q("SpartanBelle");
			if (belle.items.length != 0) {
				if (Math.abs(belle.first().p.x - this.p.x) < 9
					&& Math.abs(belle.first().p.y - (this.p.y + 80)) < 64) {
					belle.destroy();
					Q.audio.play("eat.ogg");
					Q.audio.stop("rocket0.ogg");
					Q.audio.stop("rocket1.ogg");
					for (var i = 0; i < 10; i++) {
						this.stage.insert(new Q.MoreBlood({
							x: this.p.x,
							y: this.p.y,
							frame: 10 + Math.floor(Math
								.random() * 2),
							vx: -Math.random() * 500,
							vy: Math.random() * 1000 -
								500,
							angle: this.p.angle,
							av: 0,
							maxX: this.p.maxX,
							maxY: this.p.maxY
						}));
					}
					this.stage.insert(new Q.EndLevel({horse: this}));
					this.p.frame = 1;
				}
			}
		}
	});

	// Screen darkener
	Q.Sprite.extend("Dark", {
		init: function(p) {
			this._super(p, {
				w: 1,
				h: 1,
				type: 32
			});
		},
		step: function(dt) {
			this.p.x = this.p.horse.p.x;
			this.p.y = this.p.horse.p.y;
		},
		draw: function(ctx) {
			if (darken > 0.02) {
				ctx.setTransform(1, 0, 0, 1, 0,
					0);
				ctx.fillStyle =
					"rgba(0, 0, 0, " + Math.min(darken, 0.4) +
					")";
				ctx.fillRect(0, 0, 800, 600)
			}
			darken *= 0.6;
		}
	});

	// Level ender
	Q.Sprite.extend("EndLevel", {
		init: function(p) {
			this._super(p, {
				w: 1,
				h: 1,
				type: 32,
				amt: 0
			});
			endGame = true;
			var oldtimescale = timescale;
			console.log(oldtimescale);
			if (oldtimescale == 20)
				oldtimescale = 1;
			this.p.oldtimescale = oldtimescale;
			setTimeout(function() {
				timescale = oldtimescale;
				Q.audio.stop();
				Q.clearStages();
				Q.stageScene("stageclear");
			}, 2000);
		},
		step: function(dt) {
			if (this.p.horse) {
				this.p.x = this.p.horse.p.x;
				this.p.y = this.p.horse.p.y;
			}
			timescale = Math.max(0, timescale - dt * 2);
			this.p.amt = (this.p.oldtimescale - timescale) / this.p.oldtimescale / 4;
		},
		draw: function(ctx) {
			ctx.setTransform(1, 0, 0, 1, 0,
				0);
			ctx.fillStyle =
				"rgba(255, 255, 255, " + this.p
				.amt + ")";
			ctx.fillRect(0, 0, 800, 600)
		}
	});

	// Fish Part
	Q.Sprite.extend("TheFishPart", {
		init: function(p) {
			this._super(p, {
				asset: "fish.png",
				cx: 6,
				cy: 21,
				av: 0,
				scale: 0.001,
				dist: 1000,
				type: 6,
				av: (Math.random() - 0.5) * 256,
				angle: Math.random() * 360, //Math.PI * 2, dammit
				collisionMask: 1
			});
			this.add("2d");
			this.p.gravity = 0;
			//this.add('2d, platformerControls');
		},
		step: function(dt) {
			
			this.p.dist -= dt * 500;
			
			this.p.x += ((this.p.x - 400) * (1 / this.p.dist)) * (400 * dt);
			this.p.y += ((this.p.y - 300) * (1 / this.p.dist)) * (400 * dt);
			
			this.p.scale = (1 / this.p.dist) * 100;
			
			this.p.angle += this.p.av * dt;
			
			if (this.p.x > 800 || this.p.x <
				0 || this.p.y > 600 || this.p.y <
				0) {
				this.destroy();
			}
		},
	});
}
