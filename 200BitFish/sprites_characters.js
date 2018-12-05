/*
 * sprites_characters.js
 * So in quintus, sprites are like gamemaker objects.
 * This js has all the characters the game
 */

// Messages that are shown on death
var deathMsgs = {
	fall: [
		"*flew through a pile of rocks",
		"*got hit by something really hard",
		"*hit something really hard",
		"*doesn't know that physics thing",
		"*flies like a chicken... inside a jet engine"
	],
	thedragon: [
		"*got impaled by long iron rods from the ground",
		"*was forced to be vaccinated",
		"*was popped like a balloon that flew towards a jet engine",
		"*needed more spikes to distribute weight",
		"*somehow felt like a mammoth with a long steel beam through its side",
		"*was stabbed with tall metal bars on the terrain",
		"*pressure was released and caused an explosion of vital organs",
		"*insides were mashed and rapid decomposition caused a burst of vital organs"
	],
	tilt: [
		"*doesn't know how to balance",
		"*got hit in the face by dirt and made lots of blood",
		"*landed face not horizontal enough",
		"*tilted, like a jet engine"
	],
	voided: ["*hit an invisible spike",
		"*broken by the 4th and 2nd wall itself",
		"*implode because of a negative air pressure",
		"*teleported into a room of spikes and back",
		"*was cut by the borders",
		"*was killed by animals that live in voids.",
		"*was actually crushed by the borders"
	],
	walrus: [
		"*was f*cked so hard on the face it made a new as*hole",
		"*got a FAST WALRUS right into the face and made a new as*hole",
		"*seems to be having a bad day with feeding the walruses",
		"*couldn't dodge because the game is 2D",
		"*failed to eat a walrus"
	],
	ewalrus: [
		"*hit a walrus with a car",
		"*hit a walrus with a jet engine",
		"*killed a walrus with USB laser gun",
		"*gave a walrus a new as*hole",
		"*continues to kill walruses",
		"*doesn't stop killing the animals"
	],
	shoot: ["EXTERMINATE", "FIRE FIRE FIRE", "BANG BANG BANG",
		"PEW PEW PEW", "DESTROY", "I WILL DESTROY YOU AND EAT YOUR CHILDREN"
	],
	explode: [
		"*somehow exploded on death",
		"BOOOOOOOOOOOOOOOOOOOOOOOM",
		"*found out what it's like to be a dead whale",
		"*found out what it's like to be that blocky green thing",
		"*just exploded",
		"*exploded again",
		"*found out what it's like to be a dead whale packed with explosives",
		"*all vital organs exploded due to rapid decomposition"
	],
	blood: ["bam bam bam bam bam"],
	killer: ["\"lol you suck\"", "\"you're terrible at this\"", "\"i destroyed all internal organs\"", "\"you died\"",
		"\"ha ha\"", "\"tfw when you keep dying\""]
}

var loadSpritesA = function() {

	// Mane pone
	Q.Sprite.extend("AdorableHorse", {
		init: function(p) {
			this._super(p, {
				sheet: "horse",
				sprite: "flashyhorse",
				points: [
					[-20, -35],
					[20, -35],
					[20, 35],
					[-20, 35]
				],
				frame: 38,
				cx: 50,
				cy: 35,
				ox: p.x,
				oy: p.y,
				av: 0,
				pvy: 0,
				walkspeed: 150,
				landed: false,
				left: false,
				rocketL: false,
				rocketR: false,
				rocketsizeL: 0,
				rocketsizeR: 0,
				rocketS: 0,
				dead: false,
				//collisionMask: 1,
				type: 102
			});
			this.add("2d, animation");
			this.on("bump.bottom", this,
				"landed");
			this.on("hit", this, "collision");
			//this.gravity = 0.1;
			//this.add('2d, platformerControls');
		},
		collision: function(col) {
			if (col.obj.p["killer"]) {
				this.gib(arrayRand(deathMsgs.thedragon));
			} else if (col.impact > 690) {
				this.gib(arrayRand(deathMsgs.fall));
			}

			if (col.obj.isA("FastWalrus") &&
				!col.obj.p.dead) {
				this.gib(arrayRand(deathMsgs.walrus));
			}
		},

		landed: function(col) {
			if (Q.gravityY != 0)	
				this.p.landed = true;
			//if (col.obj.p["killer"]) {
			//	this.gib();
			//}
			if (Math.abs(this.p.angle) > 45 && Q.gravityY != 0) {
				this.gib(arrayRand(deathMsgs.tilt));
			}
		},
		regen: function(tp) {
			if (!Q.inputs["drop"] || (tp.p.fish && tp.p.fish.p.quick && tp.p.fish.p.boom)) {
				if (!endGame) {
					tp.p.dead = false;
					tp.p.x = tp.p.ox;
					tp.p.y = tp.p.oy;
					//tp.p.vx = tp.p.ox;
					//tp.p.vy = 0
					tp.p.rocketL = false;
					tp.p.rocketR = false;
					tp.p.rocketS = 0;
					tp.p.av = 0;
					tp.p.angle = 0;
					tp.p.left = false;
					if (this.p.fish) {
						tp.p.fish.p.boom = false;
						tp.p.fish.p.x = tp.p.ox;
						tp.p.fish.p.y = tp.p.oy;
						tp.p.fish.p.drop = false;
					}
					checkPointed();
				}
			} else {
				setTimeout(function() {
					tp.regen(tp)
				}, 300)
			}
		},
		gib: function(cause, outview) {
			//console.log(this.p);
			if (!this.p.dead) {
				ponedeath += 66;
				Q.audio.stop("rocket0.ogg");
				Q.audio.stop("rocket1.ogg");
				this.p.dead = true;
				var th = this;

				if (this.p.fish && this.p.fish.p.quick) {
					this.stage.insert(new Q.BonusDucks({
						x: this.p.x,
						y: this.p.y - 84,
						text: ponedeath
					}));
				}
				
				if (cause) {
					htop = cause;
					openHtop();
				}
		
				if (!(this.p.flamedeath && outview)) {
					Q.audio.play("death.ogg");

					for (var i = 0; i < 4; i++) {
						this.stage.insert(new Q.MoreBlood({
							x: this.p.x,
							y: this.p.y,
							frame: 2 + Math.floor(Math
								.random() * 2),
							vx: Math.random() * 1000 -
								500,
							vy: Math.random() * 1000 -
								500,
							angle: this.p.angle,
							av: Math.random() * 80 -
								40,
							maxX: this.p.maxX,
							maxY: this.p.maxY
						}));
					}

					for (var i = 0; i < 18; i++) {
						this.stage.insert(new Q.MoreBlood({
							x: this.p.x,
							y: this.p.y,
							frame: 4 + Math.floor(Math
								.random() * 3),
							vx: Math.random() * 1000 -
								500,
							vy: Math.random() * 1000 -
								500,
							angle: this.p.angle,
							av: Math.random() * 80 -
								40,
							maxX: this.p.maxX,
							maxY: this.p.maxY
						}));
					}

					for (var i = 0; i < 12; i++) {
						this.stage.insert(new Q.MoreBlood({
							x: this.p.x,
							y: this.p.y,
							frame: 7 + Math.floor(Math
								.random() * 3),
							vx: Math.random() * 1000 -
								500,
							vy: Math.random() * 1000 -
								500,
							angle: this.p.angle,
							av: Math.random() * 80 -
								40,
							maxX: this.p.maxX,
							maxY: this.p.maxY
						}));
					}

					for (var i = 0; i < 30; i++) {
						this.stage.insert(new Q.MoreBlood({
							x: this.p.x,
							y: this.p.y,
							frame: 10 + Math.floor(
								Math.random() * 2),
							vx: Math.random() * 1000 -
								500,
							vy: Math.random() * 1000 -
								500,
							av: 0,
							maxX: this.p.maxX,
							maxY: this.p.maxY
						}));
					}

					this.stage.insert(new Q.MoreBlood({
						x: this.p.x,
						y: this.p.y,
						frame: 1,
						vx: Math.random() * 1000 -
							500,
						vy: Math.random() * 1000 -
							500,
						angle: this.p.angle,
						av: Math.random() * 80 - 40,
						maxX: this.p.maxX,
						maxY: this.p.maxY
					}));

					this.stage.insert(new Q.MoreBlood({
						x: this.p.x,
						y: this.p.y,
						frame: 0,
						vx: Math.random() * 1000 -
							500,
						vy: Math.random() * 1000 -
							500,
						angle: this.p.angle,
						av: Math.random() * 80 - 40,
						maxX: this.p.maxX,
						maxY: this.p.maxY
					}));

				} else {

					Q.stage().insert(new Q.Fireflare({
						x: this.p.x,
						y: this.p.y - 64
					}));
					for (var i = 0; i < 4; i++) {
						this.stage.insert(new Q.Explosion({
							x: this.p.x + (Math.random() - 0.5) * 200,
							y: this.p.y + (Math.random() - 0.5) * 200,
							scale: 1 + Math.random(),
							angle: (Math.random() - 0.5) * 90
						}));
					}
					Q.stage().insert(new Q.Explosion({
						x: this.p.x,
						y: this.p.y
					}));
					Q.audio.play("burn.ogg");
				}

				if (Math.random() < 0.1) {
					Q.stage().insert(new Q.Explosion({
						x: this.p.x,
						y: this.p.y
					}));
					htop = arrayRand(deathMsgs.explode);
					openHtop();
					this.stage.insert(new Q.BonusDucks({
						x: this.p.x,
						y: this.p.y - 64,
						text: "CRITICAL HIT"
					}));
					Q.audio.play(
						"deathexplode.ogg");
					Q.audio.play("crit.ogg");
				}

				setTimeout(function() {
					th.regen(th)
				}, 1000);
			}
		},
		step: function(dt) {
			//this.p.tframe += 20 * dt;
			//this.p.tframe %= 39;
			//this.p.frame = Math.floor(this.p.tframe);
			/*console.log(this.p.points[0]);
			console.log(this.p.points[1]);
			console.log(this.p.points[2]);
			console.log(this.p.points[3]);*/
			//this.p.left = !this.p.left;
			//console.log(dt);

			// Out of map
			
			if (this.p.x > this.p.maxX ||
				this.p.x < 0 || this.p.y > this
				.p.maxY) {
				this.p.x -= this.p.vx * dt;
				this.p.y -= this.p.vy * dt;
				this.gib(arrayRand(deathMsgs.voided), true);
			}

			// Is dead

			if (this.p.dead) {
				this.p.vx = 0;
				this.p.vy = 0;
				this.p.rocketL = false;
				this.p.rocketR = false;
				this.p.rocketS = 0;
				return 0;
			}

			this.p.rocketL = false;
			this.p.rocketR = false;
			this.p.pvy = this.p.vy;

			// Walking

			if (this.p.landed) {
				if (Q.inputs["left"] && !Q.inputs[
						"right"]) {
					this.p.left = true;
					this.play("walk");
					this.p.vx = Math.max(this.p.vx -
						dt * (this.p.walkspeed * 1.86), -this.p.walkspeed);
				} else if (Q.inputs["right"] &&
					!Q.inputs["left"]) {
					this.p.left = false;
					this.play("walk");
					this.p.vx = Math.min(this.p.vx +
						dt * (this.p.walkspeed * 1.86), this.p.walkspeed);
				} else {
					if (this.p.frame == 20)
						this.play("idle");
					this.p.vx *= 0.6;
				}
				this.p.angle *= Math.max(1 - dt * 7, 0);
				this.p.av *= Math.max(1 - dt * 7, 0);
				if (Math.abs(this.p.angle) < 1)
					this.p.angle = 0;

			} else {
				this.play("idle");
			}

			// Rockets

			if (Q.inputs["left_rocket"]) {
				this.p.av += 7 * dt;
				this.p.vx += Math.cos((this.p.angle -
					90) / 57.295) * (600 * dt);
				this.p.vy += Math.sin((this.p.angle -
					90) / 57.295) * (600 * dt);
				this.p.rocketL = true;
			}

			if (Q.inputs["right_rocket"]) {
				this.p.av -= 7 * dt;
				this.p.vx += Math.cos((this.p.angle -
					90) / 57.295) * (600 * dt);
				this.p.vy += Math.sin((this.p.angle -
					90) / 57.295) * (600 * dt);
				this.p.rocketR = true;
			}

			// Rocket sounds

			if (this.p.rocketR && this.p.rocketL) {
				if (this.p.rocketS != 2) {
					Q.audio.stop("rocket0.ogg");
					Q.audio.stop("rocket1.ogg");
					Q.audio.play("rocket0.ogg", {
						loop: true
					});
					this.p.rocketS = 2;
				}
			} else if (this.p.rocketR ||
				this.p.rocketL) {
				if (this.p.rocketS != 1) {
					Q.audio.stop("rocket0.ogg");
					Q.audio.stop("rocket1.ogg");
					Q.audio.play("rocket1.ogg", {
						loop: true
					});
					this.p.rocketS = 1;
				}
			} else {
				Q.audio.stop("rocket0.ogg");
				Q.audio.stop("rocket1.ogg");
				this.p.rocketS = 0;
			}

			// Calculate rocket sizes... unreadable?

			var sX = Math.cos((this.p.angle - 90) / 57.295);
			var sY = Math.sin((this.p.angle - 90) / 57.295);

			var mag = Math.sqrt(Math.pow(this.p.vx, 2) + Math.pow(this.p.vy, 2)); // Calculate magnitude, too lazy for pow
			var ssX = this.p.vx / mag; // Normalize both using magnitude
			var ssY = this.p.vy / mag;
		
			this.p.rocketsizeL = (2 - Math.sqrt(Math.pow(sX - ssX, 2) + Math.pow(sY - ssY, 2))) * mag
			this.p.rocketsizeL = Math.sqrt(Math.abs(this.p.rocketsizeL)) * 3;
			this.p.rocketsizeR = Math.max(0, this.p.rocketsizeL - this.p.av * 10); 
			this.p.rocketsizeL = Math.max(0, this.p.rocketsizeL + this.p.av * 10);

			// Other calculations

			this.p.landed = false;
			this.p.angle += this.p.av * (dt *
				50);
			// mod doesnt seem to work well here
			if (this.p.angle > 180)
				this.p.angle -= 360
			else if (this.p.angle < -180)
				this.p.angle += 360
		},
		draw: function(ctx) {
			if (!this.p.dead) {
				ctx.scale(1 - 2 * this.p.left,
					1)
				this.sheet().draw(ctx, -this.p.cx, -
					this.p.cy, this.p.frame);
				ctx.scale(2 - 4 * this.p.left,
					2);
				//window.alert(ctx.globalCompositeOperation);
				ctx.globalCompositeOperation =
					"lighter";
				var frame = Math.floor(Math.random() * 3);
				var addsize = Math.random() * 6;
				if (this.p.rocketR) {
					//Q.sheet("rocket").draw(ctx, -6, 16, Math.floor(Math.random() *
					//		3));
					ctx.drawImage(Q.asset("rocket.png"),
						Q.sheet("rocket").fx(frame),
						Q.sheet("rocket").fy(frame),
						24, 36,
						-6, 16,
						24, (this.p.rocketsizeR + addsize) / 2);
					ctx.save();
					ctx.translate(3, 18);
					ctx.rotate(Math.random() * 7);
					ctx.drawImage(Q.asset(
						"flare.png"), -128, -128);
					ctx.restore();
					darken += 0.1;
				}
				if (this.p.rocketL) {
					//Q.sheet("rocket").draw(ctx, -
					//	16, 16, Math.floor(Math.random() *
					//		3));
					
					ctx.drawImage(Q.asset("rocket.png"),
						Q.sheet("rocket").fx(frame),
						Q.sheet("rocket").fy(frame),
						24, 36,
						-16, 16,
						24, (this.p.rocketsizeL + addsize) / 2)

					
					ctx.save();
					ctx.translate(-6, 18);
					ctx.rotate(Math.random() * 7);
					ctx.drawImage(Q.asset(
						"flare.png"), -128, -128);
					ctx.restore();
					darken += 0.1;
				}
				ctx.globalCompositeOperation =
					"source-over";
			}
			if (this.p.syncstate != 3 && this.p.syncstate < 3) {
				ctx.save()
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.fillStyle = "rgb(255, 255, 255)";
				ctx.font = "18px 'Press Start 2P'";
				ctx.textAlign = "center";
				ctx.fillText("1-NOOBIE 7-STAGE", 400, 270);
				if (this.p.syncstate == 2)
					ctx.fillText("READY", 400, 300);
				ctx.restore();
			}
		},

	});

	// Did I really have to make another class?!?!
	Q.AdorableHorse.extend("SpartanBelle", {
		init: function(p) {
			this._super(p, {
				sheet: "horse",
				sprite: "flashyhorse",
				points: [
					[-20, -35],
					[20, -35],
					[20, 35],
					[-20, 35]
				],
				frame: 38,
				cx: 50,
				cy: 35,
				ox: p.x,
				oy: p.y,
				av: 0,
				pvy: 0,
				landed: false,
				left: true,
				rocketL: false,
				rocketR: false,
				rocketS: 0,
				shotdeb: 2,
				dead: false,
				//collisionMask: 1,
				syncstate: 0,
				type: 102
			});
			this.p.shootspeed = 0.2;
			this.p.shotdeb = 1;
			this.add("2d, animation");
			this.on("bump.bottom", this,
				"landed");
			this.on("hit", this, "collision");
			var s = this.p;
			if (s.syncstate != 3) {
				Q.audio.play("spartanx.ogg");
				setTimeout(function() {
					s.syncstate = 1;
				}, 5000 / timescale);
				setTimeout(function() {
					s.syncstate = 2;
				}, 6100 / timescale);
				setTimeout(function() {
					s.syncstate = 3;
				}, 8000 / timescale);
			}
		},
		blood: function() {
			if (this.p.syncstate != 4) {
				for (var i = 0; i < 2; i++) {
					this.stage.insert(new Q.MoreBlood({
						x: this.p.x,
						y: this.p.y,
						frame: 2 + Math.floor(Math
							.random() * 2),
						vx: Math.random() * 1000 -
							500,
						vy: -Math.random() * 700,
						angle: this.p.angle,
						av: Math.random() * 80 -
							40,
						maxX: this.p.maxX,
						maxY: this.p.maxY
					}));
				}
				for (var i = 0; i < 7; i++) {
					this.stage.insert(new Q.MoreBlood({
						x: this.p.x,
						y: this.p.y,
						frame: 7 + Math.floor(Math
							.random() * 3),
						vx: Math.random() * 1000 -
							500,
						vy: -Math.random() * 700,
						angle: this.p.angle,
						av: Math.random() * 80 -
							40,
						maxX: this.p.maxX,
						maxY: this.p.maxY
					}));
				}
			}
			for (var i = 0; i < 5; i++) {
				this.stage.insert(new Q.MoreBlood({
					x: this.p.x,
					y: this.p.y,
					frame: 10 + Math.floor(Math
						.random() * 2),
					vx: Math.random() * 1000 -
						500,
					vy: Math.random() * 1000 -
						500,
					av: 0,
					maxX: this.p.maxX,
					maxY: this.p.maxY
				}));
			}
		},
		regen: function(tp) {
			if (!endGame) {
				tp.p.dead = false;
				tp.p.x = tp.p.ox;
				tp.p.y = tp.p.oy;
				tp.p.rocketL = false;
				tp.p.rocketR = false;
				tp.p.rocketS = 0;
				tp.p.av = 0;
				tp.p.angle = 0;
				checkPointed();
				var fags = Q("FastWalrus").items;
				for (var i = 0; i < fags.length; i++) {
					if (!fags[i].p.nodespawn)
						fags[i].destroy();
				}
			}
		},
		step: function(dt) {

			if (this.p.syncstate == 3) {

				// Gun

				if (Q.inputs["drop"] && !this.p.dead) {
					if (this.p.shotdeb > this.p.shootspeed) {
						this.p.shotdeb = 0;
						if (this.p.shootspeed == 0.2) {
							Q.audio.play(
								"exterminate.ogg");
						} else {
							Q.audio.play(
								"dsplasma.ogg");
						}
						this.stage.insert(new Q.SHOOP({
							horse: this,
							x: this.p.x,
							y: this.p.y - 50
						}));
						if (Math.random() < 0.1) {
							htop = arrayRand(deathMsgs.shoot);
							openHtop();
						}
					}
				}

				this.p.shotdeb += dt;

				// Out of map
			
				if (this.p.x > this.p.maxX ||
					this.p.x < 0 || this.p.y > this
					.p.maxY) {
					this.p.x -= this.p.vx * dt;
					this.p.y -= this.p.vy * dt;
					this.gib(arrayRand(deathMsgs.voided), true);
				}

				// Is dead

				if (this.p.dead) {
					this.p.vx = 0;
					this.p.vy = 0;
					this.p.rocketL = false;
					this.p.rocketR = false;
					this.p.rocketS = 0;
					return 0;
				}

				this.p.rocketL = false;
				this.p.rocketR = false;
				this.p.pvy = this.p.vy;

				// Walking

				if (this.p.landed) {
					if (Q.inputs["left"] && !Q.inputs[
							"right"]) {
						this.p.left = true;
						this.play("walk");
						this.p.vx = Math.max(this.p.vx -
							dt * 280, -150);
					} else if (Q.inputs["right"] &&
						!Q.inputs["left"]) {
						this.p.left = false;
						this.play("walk");
						this.p.vx = Math.min(this.p.vx +
							dt * 280, 150);
					} else {
						if (this.p.frame == 20)
							this.play("idle");
						this.p.vx *= 0.6;
					}
					this.p.angle *= Math.min(0.95,
						dt * 80);;
					this.p.av *= Math.min(0.95, dt *
						80);
					if (Math.abs(this.p.angle) < 1)
						this.p.angle = 0;

				} else {
					// Allow change direction in constant fall
					if (Q.gravityY == 0) {
						if (Q.inputs["left"] && !Q.inputs[
								"right"]) {
							this.p.left = true;
							this.play("walk");
						
						} else if (Q.inputs["right"] &&
							!Q.inputs["left"]) {
							this.p.left = false;
							this.play("walk");
						} else {
							if (this.p.frame == 20)
								this.play("idle");
						}
					} else {
						this.play("idle");
					}
				}

				

				// Rockets

				if (Q.inputs["left_rocket"]) {
					this.p.av += 7 * dt;
					this.p.vx += Math.cos((this.p.angle -
						90) / 57.295) * (600 * dt);
					this.p.vy += Math.sin((this.p.angle -
						90) / 57.295) * (600 * dt);
					this.p.rocketL = true;
				}

				if (Q.inputs["right_rocket"]) {
					this.p.av -= 7 * dt;
					this.p.vx += Math.cos((this.p.angle -
						90) / 57.295) * (600 * dt);
					this.p.vy += Math.sin((this.p.angle -
						90) / 57.295) * (600 * dt);
					this.p.rocketR = true;
				}

				// Rocket sounds

				if (this.p.rocketR && this.p.rocketL) {
					if (this.p.rocketS != 2) {
						Q.audio.stop("rocket0.ogg");
						Q.audio.stop("rocket1.ogg");
						Q.audio.play("rocket0.ogg", {
							loop: true
						});
						this.p.rocketS = 2;
					}
				} else if (this.p.rocketR ||
					this.p.rocketL) {
					if (this.p.rocketS != 1) {
						Q.audio.stop("rocket0.ogg");
						Q.audio.stop("rocket1.ogg");
						Q.audio.play("rocket1.ogg", {
							loop: true
						});
						this.p.rocketS = 1;
					}
				} else {
					Q.audio.stop("rocket0.ogg");
					Q.audio.stop("rocket1.ogg");
					this.p.rocketS = 0;
				}

				// Calculate rocket sizes... unreadable?

				var sX = Math.cos((this.p.angle - 90) / 57.295);
				var sY = Math.sin((this.p.angle - 90) / 57.295);

				var mag = Math.sqrt(Math.pow(this.p.vx, 2) + Math.pow(this.p.vy, 2)); // Calculate magnitude, too lazy for pow
				var ssX = this.p.vx / mag; // Normalize both using magnitude
				var ssY = this.p.vy / mag;
		
				this.p.rocketsizeL = (2 - Math.sqrt(Math.pow(sX - ssX, 2) + Math.pow(sY - ssY, 2))) * mag
				this.p.rocketsizeL = Math.sqrt(Math.abs(this.p.rocketsizeL)) * 3;
				this.p.rocketsizeR = Math.max(0, this.p.rocketsizeL - this.p.av * 10); 
				this.p.rocketsizeL = Math.max(0, this.p.rocketsizeL + this.p.av * 10);

				// Other calculations

				this.p.landed = false;
				this.p.angle += this.p.av * (dt *
					50);
				// mod doesnt seem to work well here
				if (this.p.angle > 180)
					this.p.angle -= 360
				else if (this.p.angle < -180)
					this.p.angle += 360
			} else if (this.p.syncstate == 1) {
				this.p.left = true;
				this.play("walk");
				this.p.vx = Math.max(this.p.vx - dt * 280, -150);
			} else if (this.p.syncstate == 4) {
				this.play("squish");
				this.p.vx *= 0.6;
				Q.audio.stop("rocket0.ogg");
				Q.audio.stop("rocket1.ogg");
				this.p.rocketS = 0;
				this.p.angle = 0;
				this.p.rocketL = false;
				this.p.rocketR = false;
			} else {
				this.p.left = true;
				if (this.p.frame == 20)
					this.play("idle");
				this.p.vx *= 0.6;
			}
		}
	});

	// The Killer
	Q.Sprite.extend("Killer", {
		init: function(p) {
			this._super(p, {
				sheet: "redandblackoc",
				sprite: "generico",
				cx: 77,// 62, 103
				cy: 64, //-15, 39
				left: false,
				landed: false,
				target: null,
				cooldown: 0,
				dodeath: false,
				type: 1,
				rocketsound: false,
				dead: false,
				health: 100
			});
			this.add("2d, animation");
			this.on("hit", this, "collision");
			this.on("bump.bottom", this,
				"landed");
			this.on("celebrate", this,
				"stand");
			this.play("norm");
		},
		collision: function(col) {
			if (col.obj.isA("SpartanBelle") &&
				!this.p.target.p.dead) {
				this.p.left = (col.obj.p.x <
					this.p.x);
				this.play("buck");
				col.obj.gib(arrayRand(deathMsgs
					.killer));
				this.stage.insert(new Q.BonusDucks({
					x: col.obj.p.x,
					y: col.obj.p.y - 30,
					text: "CRITICAL HIT"
				}));
				Q.audio.play("crit.ogg");
			}
		},
		death: function() {
			this.p.dead = true;
			this.p.target.p.syncstate = 1;
			this.p.vx = 0;
			var oldRender = this.stage.render;
			port.unfollow();
			port.centerOn(400, 300);
			var cutscene = doCutScene({
				pages: ["cs/stg13_1.png"],
				text: [
					"N" + "UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU ".repeat(202) + " I HAVE BEEN DEFEETED"
				]
			}, function() {
				Q.stage().render = oldRender;
				Q("Dark").first().destroy();
				Q("Killer").first().p.dodeath =
					true;
				Q("Killer").first().p.cooldown =
					8;
				Q("SpartanBelle").first().p.syncstate =
					3;
				port.follow(Q("Killer").first(), {
					x: true,
					y: true
				}, {
					minX: 0,
					maxX: Q.stage()._collisionLayers[
						0].p.w,
					minY: 0,
					maxY: Q.stage()._collisionLayers[
						0].p.h
				});
			});
			this.stage.render = function(ctx) {
				cutscene.render(ctx);
			}

			Q.audio.stop();
			Q.audio.play("2SAD4ME.ogg");
		},
		step: function(dt) {
			if (dt == NaN)
				dt = 0.01;
			this.p.y = Math.max(this.p.y, 50);
			this.p.cooldown = Math.max(0,
				this.p.cooldown - dt);
			this.p.rocket = false;
			if (!this.p.dead) {
				this.p.target = Q(
					"SpartanBelle").first();
				if (!this.p.target.p.dead) {
					var level = (this.p.y > 5 * 48 - 15) +
						(this.p.y > 11 * 48 - 15) + (this.p
							.y > 17 * 48 - 15);
					var hlevel = (this.p.target.p.y >
						6 * 48) + (this.p.target.p.y >
						12 * 48) + (this.p.target.p.y >
						18 * 48);
					this.p.left = (this.p.vx > 0);
					this.play("norm");
					if (this.p.health > 4) {
						// Slow moving
						if (level == hlevel) {
							this.p.vx = Math.min(1, Math
								.max(this.p.target.p.x -
									this.p.x, -1)) * 100;
						} else if (level > hlevel) {
							// go up
							if (level % 2 == 1) {
								// go to center
								this.p.vx = Math.min(1,
									Math.max(768 - this.p.x, -
										1)) * 100;
								if (Math.abs(768 - this.p.x) <
									120) {
									// go up now
									this.p.vy = Math.min(-150,
										this.p.vy - 10 * dt);
									this.p.rocket = true;
								}
							} else {
								// go to sides
								this.p.vx = -Math.min(1,
									Math.max(768 - this.p.x, -
										1)) * 100;
								if (Math.abs(768 - this.p.x) >
									368) {
									// go up now
									this.p.vy = Math.min(-150,
										this.p.vy - 10 * dt);
									this.p.rocket = true;
								}
							}
						} else if (level < hlevel) {
							// go down
							if (level % 2 == 0) {
								// go to center
								this.p.vx = Math.min(1,
									Math.max(768 - this.p.x, -
										1)) * 100;
							} else {
								// go to sides
								this.p.vx = -Math.min(1,
									Math.max(768 - this.p.x, -
										1)) * 100;
							}
						}
					} else {
						// You're fucked
						if (level == hlevel) {
							this.p.vx = Math.min(1, Math
								.max(this.p.target.p.x -
									this.p.x, -1)) * 500;
						} else if (level > hlevel) {
							// go up
							if (level % 2 == 1) {
								// go to center
								this.p.vx = Math.min(1,
									Math.max(768 - this.p.x, -
										1)) * 500;
								if (Math.abs(768 - this.p.x) <
									120) {
									// go up now
									this.p.vy = 0;
									this.p.y -= 30;
								}
							} else {
								// go to sides
								this.p.vx = -Math.min(1,
									Math.max(768 - this.p.x, -
										1)) * 500;
								if (Math.abs(768 - this.p.x) >
									368) {
									// go up now
									this.p.vy = 0;
									this.p.y -= 30;
								}
							}
						} else if (level < hlevel) {
							// go down
							if (level % 2 == 0) {
								// go to center
								this.p.vx = Math.min(1,
									Math.max(768 - this.p.x, -
										1)) * 500;
							} else {
								// go to sides
								this.p.vx = -Math.min(1,
									Math.max(768 - this.p.x, -
										1)) * 500;
							}
						}

					}

					// Weapons, health < 50
					if (this.p.health < 50 && this
						.p.cooldown == 0 && Math.random() <
						0.05) {
						Q.audio.play(
							"exterminate2.ogg");
						this.p.cooldown = 2;
						var ang = [this.p.target.p.x -
							this.p.x, this.p.target.p.y -
							this.p.y
						]; // Direction vector
						var mag = Math.sqrt(ang[0] *
							ang[0], ang[1] * ang[1]); // Calculate magnitude
						ang[0] /= mag; // Make into unit vector
						ang[1] /= mag;
						this.stage.insert(new Q.Boolet({
							x: this.p.x,
							y: this.p.y,
							vx: ang[0] * 200,
							vy: ang[1] * 200
						}));
						// no trig?
					}

					if (this.p.health <= 0)
						this.death();

					if (this.p.rocket) {
						if (!this.p.rocketsound) {
							this.p.rocketsound = true;
							Q.audio.play("otherrocket.ogg");
						}
					} else {
						Q.audio.stop("otherrocket.ogg");
						this.p.rocketsound = false;
					}

				} else {
					this.p.vx = 0;
				}
			} else if (this.p.dodeath) {
				if (Math.random() < 0.1) {
					Q.audio.stop(
						"deathexplode.ogg");
					Q.audio.play(
						"deathexplode.ogg");
					this.stage.insert(new Q.Explosion({
						x: (Math.random() - 0.5) *
							120 + this.p.x,
						y: (Math.random() - 0.5) *
							120 + this.p.y
					}));

					for (var i = 0; i < 2; i++) {
						this.stage.insert(new Q.MoreBlood({
							x: this.p.x,
							y: this.p.y,
							frame: 4 + Math.floor(
								Math.random() * 3),
							vx: Math.random() * 1000 -
								500,
							vy: Math.random() * 1000 -
								500,
							angle: this.p.angle,
							av: Math.random() * 80 -
								40,
							maxX: this.p.maxX,
							maxY: this.p.maxY
						}));
					}

					for (var i = 0; i < 2; i++) {
						this.stage.insert(new Q.MoreBlood({
							x: this.p.x,
							y: this.p.y,
							frame: 7 + Math.floor(
								Math.random() * 3),
							vx: Math.random() * 1000 -
								500,
							vy: Math.random() * 1000 -
								500,
							angle: this.p.angle,
							av: Math.random() * 80 -
								40,
							maxX: this.p.maxX,
							maxY: this.p.maxY
						}));
					}

					for (var i = 0; i < 4; i++) {
						this.stage.insert(new Q.MoreBlood({
							x: this.p.x,
							y: this.p.y,
							frame: 10 + Math.floor(
								Math.random() * 2),
							vx: Math.random() * 1000 -
								500,
							vy: Math.random() * 1000 -
								500,
							av: 0,
							maxX: this.p.maxX,
							maxY: this.p.maxY
						}));
					}
				}
				this.play("sadd");
				if (this.p.cooldown == 0 && Q("EndLevel").length == 0) {
					this.stage.insert(new Q.EndLevel({
						horse: this
					}));
				}
			}
		},
		landed: function(col) {
			this.p.landed = true;
		},
		stand: function() {
			this.p.left = !this.p.left;
			this.play("stnd")
		},
		kill: function() {
			this.stage.insert(new Q.BonusDucks({
				x: this.p.x,
				y: this.p.y - 64,
				text: "CRITICAL HIT"
			}));
			this.p.health -= Math.floor(Math
				.random() * 10) / 10 + 0.2;
			this.p.health = Math.floor(this.p
				.health * 10) / 10
			Q.audio.play("crit.ogg");
		},
		draw: function(ctx) {
			if (!(this.p.dodeath && this.p.cooldown <
					4)) {
				ctx.scale(1 - 2 * this.p.left,
					1);
				this.sheet().draw(ctx, -this.p.cx, -
					this.p.cy, this.p.frame);
				ctx.scale(2 - 4 * this.p.left,
					2);
				if (this.p.rocket && this.p.frame == 0) {

					ctx.globalCompositeOperation =
					"lighter";
					ctx.drawImage(Q.asset("rocket.png"),
						Q.sheet("rocket").fx(1),
						Q.sheet("rocket").fy(1),
						24, 36,
						-10 - this.p.left * 4, 30,
						50, 5 + Math.max(-this.p.vy / 5, 0) + Math.random() * 10);
					ctx.save();
					ctx.translate(- this.p.left * 4, 30);
					ctx.rotate(Math.random() * 7);
					ctx.drawImage(Q.asset(
						"flare.png"), -256, -256, 512, 512);
					ctx.restore();

					ctx.drawImage(Q.asset("rocket.png"),
						Q.sheet("rocket").fx(1),
						Q.sheet("rocket").fy(1),
						24, 36,
						-30 - this.p.left * 4, 30,
						50, 5 + Math.max(-this.p.vy / 5, 0) + Math.random() * 10)

					
					ctx.save();
					ctx.translate(10 - this.p.left * 4, 30);
					ctx.rotate(Math.random() * 7);
					ctx.drawImage(Q.asset(
						"flare.png"), -256, -256, 512, 512);
					ctx.restore();
					darken += 0.6;
				}
				ctx.globalCompositeOperation =
					"source-over";
			}
		},
	});

	// Fish
	Q.Sprite.extend("TheFish", {
		init: function(p) {
			this._super(p, {
				asset: "fish.png",
				cx: 6,
				cy: 1,
				av: 0,
				type: 6,
				collisionMask: 1,
				boom: false,
				drop: false,
				maxY: Q.stage()._collisionLayers[
					0].p.h
			});
			this.add("2d");
			this.on("hit", this, "collision");
			this.p.horse.p.fish = this;
			//this.gravity = 0.1;
			//this.add('2d, platformerControls');
		},
		collision: function(col) {
			//console.log(col);
			if (!col.obj.isA("TheBucket") && !this.p.boom) {
				this.stage.insert(new Q.Explosion({
					x: this.p.x,
					y: this.p.y + 20,
					scale: 0.4
				}));
				this.stage.insert(new Q.BonusDucks({
					x: this.p.x,
					y: this.p.y - 10,
					text: "CRITICAL HIT"
				}));
				Q.audio.play("crit.ogg");
				var fishy = this;
				setTimeout(function() {
					fishdeath += 66;
					if (fishy.p.quick) {
						Q("AdorableHorse").first().regen(Q("AdorableHorse").first());
						
						port.follow(Q("AdorableHorse").first(), {
							x: true,
							y: true
						}, {
							minX: 0,
							maxX: Q.stage()._collisionLayers[
								0].p.w,
							minY: 0,
							maxY: Q.stage()._collisionLayers[
								0].p.h
						});
					} else {
						Q.clearStages();
						Q.stageScene("ripfish");
						Q.audio.stop();
						Q.audio.play("SAD.ogg");
					}
				}, 300);
				if (!this.p.quick)
					this.destroy();
				else {
					this.p.boom = true;
					this.stage.insert(new Q.BonusDucks({
						x: this.p.x,
						y: this.p.y - 30,
						text: (fishdeath + 66)
					}));
				}
			}
		},
		step: function(dt) {
			if (Q.inputs["drop"]) {
				this.p.drop = true;
				port.follow(this, {
					x: true,
					y: true
				}, {
					minX: 0,
					maxX: this.stage._collisionLayers[
						0].p.w,
					minY: 0,
					maxY: this.stage._collisionLayers[
						0].p.h
				});
			}
			if (!this.p.drop) {
				this.p.vy = (this.p.horse.p.y -
					50 - this.p.y) * 10;
				this.p.vx = (this.p.horse.p.x +
					(50 * (1 - 2 * this.p.horse.p
						.left)) - this.p.x) * 10;
				this.p.av = Math.max(-90, Math.min(
					this.p.vx / 2, 90));
				this.p.angle += this.p.av / 2 -
					this.p.angle;
			}
			if (this.p.maxY < this.p.y) {
				Q.clearStages();
				Q.stageScene("lostfish");
				Q.audio.stop();
			}
		},
	});

	// FastWalrus
	Q.Sprite.extend("FastWalrus", {
		init: function(p) {
			this._super(p, {
				asset: "walrus.png",
				cx: 16,
				cy: 16,
				dead: false,
				collisionMask: 1 | 6
			});
			this.add("2d");
		},
		step: function(dt) {
			if (!this.p.dead) {
				if (!this.p.stand) {
					var horse = Q("SpartanBelle").first();
						if (horse) {
						if (Math.random() < dt && Math.abs(
								horse.p.x - this.p.x) < 512 +
							horse.p.vx) {
							this.p.vy = Math.min((horse.p.y -
								this.p.y) * 4, -300);
							Q.audio.play("naet.ogg");
						}
						this.p.vx = Math.min(1, Math.max(
								horse.p.x - this.p.x, -1)) *
							200;
					}
				} else {
					// if random moment and near camera
					if (Math.random() < dt
						&& Math.sqrt(Math.pow(this.p.x - port.viewport.centerX, 2)
						+ Math.pow(this.p.y - port.viewport.centerY, 2)) < 400) {
						Q.audio.play("naet.ogg");
					}

				}
			} else {
				this.p.vx *= 0.8;
			}
		},
		kill: function(col) {
			this.c.points = [
				[0, 0],
				[0, 0],
				[0, 0]
			];
			this.p.points = [
				[0, 0],
				[0, 0],
				[0, 0]
			];
			this.p.gravity = 0;
			this.p.type = 0;
			this.p.collisionMask = 0;
			this.c.type = 0;
			this.c.collisionMask = 0;
			this.p.vy = 0;
			if (!this.p.dead) {
				htop = arrayRand(deathMsgs.ewalrus);
				openHtop();
				this.p.dead = true;
				if (Math.random() > 0.2) {
					Q.audio.play("wdeath.ogg");
					var car = this;
					this.stage.insert(new Q.BonusDucks({
						x: this.p.x,
						y: this.p.y - 20,
						text: "CRITICAL HIT"
					}));
					setTimeout(function() {
						car.destroy();
						Q.stage().insert(new Q.Explosion({
							x: car.p.x,
							y: car.p.y
						}));
					}, 1560 / timescale);
					Q.audio.play("crit.ogg");
				} else {
					for (var i = 0; i < 4; i++) {
						this.stage.insert(new Q.Explosion({
							x: this.p.x + (Math.random() - 0.5) * 60,
							y: this.p.y + (Math.random() - 0.5) * 60,
							scale: 1 + Math.random(),
							angle: (Math.random() - 0.5) * 90
						}));
					}
					Q.stage().insert(new Q.Explosion({
						x: this.p.x,
						y: this.p.y
					}));
					Q.audio.play("deathexplode.ogg");
					this.destroy();
				}
			}
		}
	});

	// Bundle
	Q.Sprite.extend("Bundle", {
		init: function(p) {
			this._super(p, {
				sheet: "bundle",
				frame: 0,
				collisionMask: 1 | 6
			});
			this.add("2d");
			this.on("bump.top", this,
				"collision");
			//this.gravity = 0.1;
			//this.add('2d, platformerControls');
		},
		step: function(dt) {
			this.p.vx = 100;
		},
		collision: function(col) {
			col.obj.destroy();
			this.destroy();
			Q.stage().viewport.entity.unfollow();
			Q.stage().viewport.entity.centerOn(
				400, 300);
			var cutscene = doCutScene({
				speed: 100,
				pages: ["cs/stg5_2.png", "cs/stg5_2.png", "cs/stg5_2.png", "cs/stg5_2.png"],
				text: [
					"OH F*CK", "I'M BLEEDING", "I NEED A MEDICK I AM VERY VERY INJURED AND NEED A MEDICK", "I AM GOING TO TELEPORT AWAY NOW"
				]
			}, function() {
				Q.stage().insert(new Q.EndLevel({
					horse: this
				}));
			});
			Q.stage().render = function(ctx) {
				cutscene.render(ctx);
			};
		}
	});

	// Trawdis
	Q.Sprite.extend("Tawdis", {
		init: function(p) {
			this._super(p, {
				sheet: "tawdis",
				cactive: false,
				collisionMask: 138,
				points: [
					[-117, -36],
					[43, -36],
					[43, 36],
					[-117, 36]
				],
				frame: 0,
				cx: 122,
				cy: 128,
				flap: false,
				health: 999,
				type: 56,
				shot: 0,
				shotdeb: 0.08,
				consekutiveshots: 0
			});
			this.add("2d");
			this.on("hit", this, "collision");
			this.gravity = 0.05;
			//this.add('2d, platformerControls');
		},
		step: function(dt) {
			if (!this.stage.stopeverything) {
				this.p.x = Math.min(200, this.stage.time * 100);
				this.p.angle = this.p.vy / 40;
				this.p.shot = Math.max(0, this.p
					.shot - dt);
				if (Q.inputs["left_rocket"] || Q
					.inputs["right_rocket"]) {
					this.p.cactive = true;
					if (!this.p.flap) {
						//this.p.vy = -500;
						this.p.vy = Math.max(-500,
							this.p.vy - dt * 3400);
					}
					//this.p.flap = true;
				} else
					this.p.flap = false;

				if (this.p.cactive && Q.inputs["drop"] && this.p.shot ==
					0) {
					this.p.shot = this.p.shotdeb /
						1;
					var recallback = 0; // spread made it too easy (Math.random() - 0.5) * Math.min(this.p.consekutiveshots, 30) / 2;
					this.stage.insert(new Q.Bang({
						horse: this,
						vx: Math.cos((this.p.angle + recallback) /
							57.295) * 1800,
						vy: Math.sin((this.p.angle + recallback) /
							57.295) * 1800,
						angle: this.p.angle + recallback,
						x: this.p.x + Math.cos((
								this.p.angle - 26) /
							57.295) * 112,
						y: this.p.y + Math.sin((
								this.p.angle - 26) /
							57.295) * 112
					}));
					this.p.consekutiveshots ++;
				
					Q.audio.play("tgun.ogg");
				} else if (!Q.inputs["drop"])
					this.p.consekutiveshots = 0;

				if (this.p.health <= 0) {
					//Q.audio.play("deathexplode.ogg");
					//this.stage.insert(new Q.Explosion({
					//	x: this.p.x,
					//	y: this.p.y,
					//	scale: 8
					//}));
					//this.destroy();
					Q.audio.stop();
					Q.clearStages();
					Q.stageScene("drown");
				}

				if (this.p.y >= 500) {
					Q.audio.play("proghit.ogg");
					this.stage.insert(new Q.Explosion({
						x: this.p.x,
						y: this.p.y + 50,
						scale: 1,
						vx: -1000
					}));
					this.p.vy /= 1.6;
					this.p.y = 500;
					this.p.health -= Math.floor(
						Math.random() * 4 + 2);
					this.p.angle = Math.random() *
						360;
					this.stage.boomA = 20;
				}

				if (this.p.x != 200) {
					this.p.cactive = false;
				}
				if (!this.p.cactive) {
					this.p.vy = 0;
					this.p.angle = Math.cos(this.stage.time) * 10;
					this.p.y = 300 + Math.sin(this.stage.time) * 70;
				}
			} else {
				this.p.vx = 0;
				this.p.vy = 0;
			}
		},
		collision: function(col) {
			if (col.obj.isA("Brick")) {
				Q.audio.play("proghit.ogg");
				this.stage.insert(new Q.Explosion({
					x: col.obj.p.x,
					y: col.obj.p.y,
					vx: -1000,
					scale: 0.6
				}));
				col.obj.destroy();
				this.p.health -= Math.floor(
					Math.random() * 4 + 43);
				this.p.vy += 1000;
				this.stage.boomA = 40;
			}
		},
		draw: function(ctx) {
			if (this.p.shot > this.p.shotdeb -
				0.04)
				this.p.frame = 1;
			this.sheet().draw(ctx, -this.p.cx, -
				this.p.cy, this.p.frame);
			ctx.globalCompositeOperation =
				"lighter";
			this.sheet().draw(ctx, -this.p.cx, -
				this.p.cy, this.p.frame + 2);
			var batponysayseeeesomehow = Math.random() * 100 + 100;
			ctx.drawImage(Q.asset(
					"tardisjet.png"), -this.p.cx - batponysayseeeesomehow, -
				this.p.cy, batponysayseeeesomehow, 256);
			ctx.globalCompositeOperation =
				"source-over";
			/*ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
			ctx.beginPath();
			ctx.moveTo(-this.p.cx + 144, -this.p.cy + 86);
			ctx.lineTo(-this.p.cx + 800, -this.p.cy + 86);
			ctx.stroke();*/
			this.p.frame = 0;
		}
	});

	Q.Sprite.extend("FlyingFag", {
		init: function(p) {
			this._super(p, {
				sheet: "bundle",
				cx: 64,
				cy: 64,
				type: 125,
				frame: 2,
				gravity: 0,
				destination: Math.random() *
					500,
				desp: false,
				health: 100
			});
			this.add("2d");
			this.on("hit", this, "collision");
		},
		lotzofblood: function() {
			for (var i = 0; i < 3; i++) {
				this.stage.insert(new Q.MoreBlood({
					x: this.p.x,
					y: this.p.y,
					frame: 4 + Math.floor(Math.random() *
						3),
					vx: -Math.random() * 500,
					vy: Math.random() * 1000 -
						500,
					angle: this.p.angle,
					av: Math.random() * 80 - 40,
					maxX: this.p.maxX,
					maxY: this.p.maxY
				}));
			}

			for (var i = 0; i < 5; i++) {
				this.stage.insert(new Q.MoreBlood({
					x: this.p.x,
					y: this.p.y,
					frame: 7 + Math.floor(Math.random() *
						3),
					vx: -Math.random() * 500,
					vy: Math.random() * 1000 -
						500,
					angle: this.p.angle,
					av: Math.random() * 80 - 40,
					maxX: this.p.maxX,
					maxY: this.p.maxY
				}));
			}

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
					av: Math.random() * 80 - 40,
					maxX: this.p.maxX,
					maxY: this.p.maxY
				}));
			}
		},
		blood: function() {
			for (var i = 0; i < 2; i++) {
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
		},
		collision: function(col) {

		},
		death: function() {

		},
		step: function(dt) {
			if (!this.stage.stopeverything) {
				if (Q("Tawdis").first().p.cactive) {
					this.p.x = Math.max(736, this.p.x - dt * 30);
				} else {
					this.p.x = 1000;
				}
			
				this.p.y += Math.sign(this.p.destination -
					this.p.y) * 100 * dt;
				if (Math.abs(this.p.destination -
						this.p.y) < 10) {
					this.p.destination = Math.random() *
						500;
				}
				if (this.p.health <= 10) {
					if (!this.p.desp) {
						this.p.health = 20;
						this.stage.stopeverything = true;
						var oldrender = this.stage.render;
						var cutscene = doCutScene({
							pages: ["cs/stg15_2.png", "cs/stg15_2.png"],
							text: [
								"You are going to DIE", "DESPURRATION ATTACK!"
							]
						}, function() {
							Q.stage().render = oldrender;
							Q.stage().stopeverything = false;
						});
						this.stage.render = function(ctx) {
							cutscene.render(ctx);
						};
					}
					this.p.desp = true;
				}
				if (Math.random() < 0.01 ||
					(this.p.desp && Math.random() <
						0.09)) {
					this.stage.insert(new Q.Brick({
						x: this.p.x,
						y: this.p.y,
						vy: -Math.random() * 60 -
							60
					}));
				}
			}
		},
		draw: function(ctx) {
			this.sheet().draw(ctx, -this.p.cx, -
				this.p.cy, this.p.frame);
			ctx.globalCompositeOperation =
				"lighter";
			this.sheet().draw(ctx, -this.p.cx, -
				this.p.cy, this.p.frame + 1);
			ctx.globalCompositeOperation =
				"source-over";
		},
	});
}
