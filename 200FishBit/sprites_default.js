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
  tilt: [ // this doesn't happen anymore
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
    "*was actually crushed by the borders",
    "*was executed for going out of view from a side that isn't the top"
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
  blood: ["bam bam bam bam bam"]
}

var loadSpritesA = function() {

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
        landed: false,
        left: true,
        rocketL: false,
        rocketR: false,
        rocketS: 0,
        shotdeb: 2,
        dead: false,
        //collisionMask: 1,
        type: 1
      });
      this.p.shootspeed = 0.2;
      this.p.shotdeb = 1;
      this.add("2d, animation");
      this.on("bump.bottom", this,
        "landed");
      this.on("hit", this, "collision");
    },
    collision: function(col) {
      if (col.impact > 690) {
        this.gib(arrayRand(deathMsgs.fall));
      }

      if (col.obj.className == "TileLayer") {
        var tile = col.obj.getTile(col.tileX, col.tileY);
        if (col.obj.p.breakables[tile + ""] && col.obj.p.breakables[tile + ""]
            < col.impact) {
          col.obj.setTile(col.tileX, col.tileY, 0);

          Q.audio.play("explode2.ogg");

          this.stage.insert(new Q.Explosion({
            x: col.tileX * 48 + 24,
            y: col.tileY * 48 + 24,
            scale: 0.7 + Math.random() * 0.2,
            angle: (Math.random() - 0.5) * 90.0
          }));
          
          var e = col.impact * 0.8;
          
          this.p.vx += col.normalX * e;
          this.p.vy += col.normalY * e;
        }
      }


      if (Math.abs(this.p.av) > 0.5) {
        var mag = Math.sqrt(col.normalX * col.normalX
                              + col.normalY * col.normalY);
        //var vec = [, ];
        var nottheta = Math.atan2(col.normalY / mag, col.normalX / mag);
        this.p.vx += Math.cos(nottheta + Math.PI / 2) * this.p.av * 2;
        this.p.vy += Math.sin(nottheta + Math.PI / 2) * this.p.av * 2;
        this.p.av *= 0.95;
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
        //this.gib(arrayRand(deathMsgs.tilt));
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
          if (Math.abs(this.p.av) < 0.5) {
            if (this.p.frame == 20)
              this.play("idle");
            this.p.vx *= 0.6;
          }
        }

        if (Math.abs(this.p.av) < 0.5) {
          this.p.angle *= Math.min(0.95,
            Math.pow(900, dt));
          this.p.av *= Math.min(0.95,
            Math.pow(3000, dt));
        }

        this.p.av -= Math.sign(this.p.av) * dt * 3;
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
        this.p.av += 8 * dt;
        this.p.vx += Math.cos((this.p.angle -
          90) / 57.295) * (600 * dt);
        this.p.vy += Math.sin((this.p.angle -
          90) / 57.295) * (600 * dt);
        this.p.rocketL = true;
      }

      if (Q.inputs["right_rocket"]) {
        this.p.av -= 8 * dt;
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

      var mag = Math.sqrt(Math.pow(this.p.vx, 2) + Math.pow(this.p.vy,
        2)); // Calculate magnitude, too lazy for pow
      var ssX = this.p.vx / mag; // Normalize both using magnitude
      var ssY = this.p.vy / mag;

      this.p.rocketsizeL = (2 - Math.sqrt(Math.pow(sX - ssX, 2) + Math.pow(
        sY - ssY, 2))) * mag
      this.p.rocketsizeL = Math.sqrt(Math.abs(this.p.rocketsizeL)) * 3;
      this.p.rocketsizeR = Math.max(0, this.p.rocketsizeL - this.p.av *
        10);
      this.p.rocketsizeL = Math.max(0, this.p.rocketsizeL + this.p.av *
        10);

      // Other calculations

      this.p.landed = false;
      this.p.angle += this.p.av * (dt *
        50);
      if (this.p.angle > 180) {
        this.p.angle -= 360
      } else if (this.p.angle < -180) {
        this.p.angle += 360
      }
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
            24, 36, -6, 16,
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
            24, 36, -16, 16,
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
    }
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
          if (Math.random() < dt &&
            Math.sqrt(Math.pow(this.p.x - port.viewport.centerX, 2) +
              Math.pow(this.p.y - port.viewport.centerY, 2)) < 400) {
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
      if (this.p.frame == 0 && (col.obj.isA("AdorableHorse") || col.obj.isA(
          "SpartanBelle") || col.obj.isA("TheFish"))) {
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
        ctx.fillText(this.p.text[i], -40 + i * 8, -50 + 4 * Math.sin(this.p
          .sine + 0.8 * i));
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
        if (Math.abs(belle.first().p.x - this.p.x) < 9 &&
          Math.abs(belle.first().p.y - (this.p.y + 80)) < 64) {
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
          this.stage.insert(new Q.EndLevel({
            horse: this
          }));
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
      this.p.amt = (this.p.oldtimescale - timescale) / this.p.oldtimescale /
        4;
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


}

