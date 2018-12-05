/*
 * stages.js
 * Self explanatory
 */
var loadStages = function() {

  var ram = [0, 0, 0];
  var exitButton = 0;

  // A hack
  Q.audio.play = function(s, options) {
    var now = new Date().getTime();

    // See if this audio file is currently being debounced, if 
    // it is, don't do anything and just return
    if (Q.audio.active[s] && Q.audio.active[s] > now) {
      return;
    }

    // If any options were passed in, check for a debounce,
    // which is the number of milliseconds to debounce this sound
    if (options && options['debounce']) {
      Q.audio.active[s] = now + options['debounce'];
    } else {
      delete Q.audio.active[s];
    }

    var soundID = Q.audio.soundID++;

    var source = Q.audioContext.createBufferSource();
    source.buffer = Q.asset(s);
    source.connect(Q.audioContext.destination);
    source.playbackRate.value = timescale;
    source.playbackRate.birds = 1;
    if (options && options.birds) {
      source.playbackRate.birds = options.birds;
    }
    if (options && options['loop']) {
      source.loop = true;
    } else {
      setTimeout(function() {
        Q.audio.removeSound(soundID);
      }, source.buffer.duration * 1000);
    }
    source.assetName = s;
    if (source.start) {
      source.start(0);
    } else {
      source.noteOn(0);
    }

    Q.audio.playingSounds[soundID] = source;

  };

  Q.gameLoop = function(callback) {

    Q.lastGameLoopFrame = new Date().getTime();
    Q.loop = true;
    Q._loopFrame = 0;
    Q.gameLoopCallbackWrapper = function() {

      var s = Object.keys(Q.audio.playingSounds)
      for (var i = 0; i < s.length; i++) {
        //console.log(Q.audio.playingSounds[i])
        if (s[i]) {

          if (Q.audio.playingSounds[s[i]].playbackRate.birds)
            Q.audio.playingSounds[s[i]].playbackRate.value = timescale *
            Q.audio.playingSounds[s[i]].playbackRate.birds;
          else
            Q.audio.playingSounds[s[i]].playbackRate.value = timescale;
        } else
          console.log(s[i]);
      }

      var now = new Date().getTime();
      Q._loopFrame++;
      Q.loop = window.requestAnimationFrame(Q.gameLoopCallbackWrapper);
      var dt = now - Q.lastGameLoopFrame;
      if (dt > Q.options.frameTimeLimit)
        dt = Q.options.frameTimeLimit;
      callback.apply(Q, [dt / 1000 * timescale]); // Speed hax go here
      Q.ctx.setTransform(1, 0, 0, 1, 0, 0);
      Q.ctx.globalCompositeOperation =
        "lighter";
      Q.ctx.fillStyle = "rgba(255, 255, 255, " + exitButton + ")";
      Q.ctx.fillRect(0, 0, 800, 800);
      if (Q.inputs["reset"]) {
        Q.ctx.globalCompositeOperation =
          "source-over";
        Q.ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
        Q.ctx.fillRect(0, 300 - 16 - 4, 800, 32 + 14);
        Q.ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
        Q.ctx.font = "32px 'Press Start 2P'";
        Q.ctx.textAlign = "center";
        Q.ctx.fillText("RESET", 400, 290);
        exitButton += dt / 1000 / 2;
        if (exitButton > 1.2) {
          if (Q.stage().prefmode != undefined) {
            if (confirm(
                "Oh, you found out how to clear the save data. Reset?")) {
              localStorage.removeItem("ThatGameAboutTheFish");
              location.reload();
            }
          } else if (Q.stage().fishy != undefined) {
            alert("Did you really think that would do anything?");
          } else {
            Q.audio.stop();
            checkpoint = -1;
            Q.audio.play("switch.ogg");
            Q.clearStages();
            Q.stageScene("menu");
          }
          exitButton = 0;
          Q.inputs["reset"] = false;
        }
      } else {
        exitButton = Math.max(0, exitButton - dt / 1000);
      }

      Q.ctx.globalCompositeOperation =
        "source-over";
      Q.lastGameLoopFrame = now;
    };

    window.requestAnimationFrame(Q.gameLoopCallbackWrapper);
    return Q;
  };

  Q.scene("menu", function(stage) {

    stage.lazy = ["2", "0", "0", " ", "F", "I", "S", "H", " ", "B", "I",
      "T"
    ];
    stage.val = 0;
    stage.fishy = 800;
    stage.prevmouse = -1;
    stage.randomSize = 0;
    stage.on("step", function(dt) {
      this.val += dt * 6;
      stage.fishy *= 0.95;
    });
    stage.render = function(ctx) {

      ctx.fillStyle = "hsl(" + (Math.floor(this.val * 20) % 360) +
        ", 100%, 5%)";
      ctx.fillRect(0, 0, 800, 600);

      ctx.font = "48px 'Press Start 2P'";
      ctx.textAlign = "left";
      for (var j = 30; 0 < j; j--) {
        // Explaination: Draw the rainbow text, with math!
        ctx.save();
        ctx.fillStyle = "hsl(" + (Math.floor(this.val * 70 - j * 40) %
            360) +
          ", 100%, 50%)";
        ctx.translate(0, -j * 4)
        for (var i = 0; i < this.lazy.length; i++) {
          // see?
          ctx.fillText(this.lazy[i], 130 + i * 48 + Math.cos(this.val +
            (i + j /
              1.4) / 2) * 16 * (j / 2 + 1), 72 + Math.sin(this.val +
            (i + j / 2) /
            2) * 16);

        }
        ctx.restore();
      }
      ctx.fillStyle = "rgb(255, 255, 255)";
      for (var i = 0; i < this.lazy.length; i++) {
        // Explaination: draw white 200 BIT FISH text
        ctx.fillText(this.lazy[i], 130 + i * 48 + Math.cos(this.val + i /
            2) *
          16, 72 + Math.sin(this.val + i / 2) * 16);
      }

      ctx.font = "16px 'Press Start 2P'";
      ctx.textAlign = "center";
      ctx.save();
      ctx.translate(400, 160)
      //ctx.scale(2, 1);
      ctx.fillText("(ACACIA VERSION)", 0, 0);
      ctx.restore();

      if (stage.fishy < 6) {

        ctx.fillText("PLAY GAME", 400, 394);
        ctx.fillText("LEVEL SELECT", 400, 426);
        ctx.fillText("USELESS BUTTON", 400, 458);
        ctx.fillText("READ THIS", 400, 490);
        ctx.fillText("MORE GOEMS", 400, 522);

        if (Q.inputs.mouseY < 544 && Q.inputs.mouseY > 384 && Math.abs(
            400 - Q.inputs
            .mouseX) < 200) {
          if (this.prevmouse != Math.floor(Q.inputs.mouseY / 32))
            this.randomSize = 128;
          ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
          ctx.fillRect(200 + this.randomSize / 2, Math.floor(Q.inputs.mouseY /
            32) * 32, 400 - this.randomSize, 32);
          this.prevmouse = Math.floor(Q.inputs.mouseY / 32);
          this.randomSize *= 0.94;
        }
      }

      // Draw the isometric fish
      // Multiple images for thickness
      // fishd is darker than fish
      ctx.save()
      ctx.translate(400, 240 + stage.fishy + Math.sin(this.val / 2) *
        10 / Math.max(1, this.fishy));
      if (Math.sin(stage.val / 6) < 0) {
        ctx.scale(-1, 1);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(Q.asset("fishd.png"), 0, 4 - 336 * Math.sin(stage
            .val / 6) /
          2, 96, 336 * Math.sin(stage.val / 6));
        ctx.drawImage(Q.asset("fishd.png"), 0, 2 - 336 * Math.sin(stage
            .val / 6) /
          2, 96, 336 * Math.sin(stage.val / 6));
        ctx.drawImage(Q.asset("fishd.png"), 0, -336 * Math.sin(stage.val /
            6) /
          2, 96, 336 * Math.sin(stage.val / 6));
        ctx.drawImage(Q.asset("fishd.png"), 0, -2 - 336 * Math.sin(
          stage.val /
          6) / 2, 96, 336 * Math.sin(stage.val / 6));
        ctx.drawImage(Q.asset("fish.png"), 0, -4 - 336 * Math.sin(stage
            .val / 6) /
          2, 96, 336 * Math.sin(stage.val / 6));
      } else {
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(Q.asset("fishd.png"), 0, 4 - 336 * Math.sin(stage
            .val / 6) /
          2, 96, 336 * Math.sin(stage.val / 6));
        ctx.drawImage(Q.asset("fishd.png"), 0, 2 - 336 * Math.sin(stage
            .val / 6) /
          2, 96, 336 * Math.sin(stage.val / 6));
        ctx.drawImage(Q.asset("fishd.png"), 0, -336 * Math.sin(stage.val /
            6) /
          2, 96, 336 * Math.sin(stage.val / 6));
        ctx.drawImage(Q.asset("fishd.png"), 0, -2 - 336 * Math.sin(
          stage.val /
          6) / 2, 96, 336 * Math.sin(stage.val / 6));
        ctx.drawImage(Q.asset("fish.png"), 0, -4 - 336 * Math.sin(stage
            .val / 6) /
          2, 96, 336 * Math.sin(stage.val / 6));
      }
      ctx.restore();

    }

    var boronthiosulphatenitride = new Q.UI.Button({
      x: 400,
      y: 300,
      w: 400,
      h: 600,
      border: 0,
      radius: 0,
      fill: "rgba(0, 0, 0, 1)"
    });

    boronthiosulphatenitride.arrimapirate = [
      function() {
        // Play
        level("1");
      },
      function() {
        // Level select
        //level(prompt("Enter number between 1 and 10\n4 to skip the hard part.",
        //	"4"));
        level("select");
      },
      function() {
        // Read this
        //level("tutorial");
      },
      function() {
        // Credits
        // show a dialog
        level("credits");
      },
      function() {
        // More
        window.open(
          "http://gamejolt.com/profile/capital-asterisk/492409/games"
        );
      }
    ];
    boronthiosulphatenitride.on("click", function() {
      if (Q.inputs.mouseY < 544 && Q.inputs.mouseY > 384) {
        this.arrimapirate[Math.floor((Q.inputs.mouseY - 384) / 32)]();
      }
    });
    setTimeout(function() {
      stage.insert(boronthiosulphatenitride);
    }, 800);

    Q.audio.play("200_FISH_BIT_INTRO.ogg");

    ponedeath = 0;
    fishdeath = 0;
    timescale = 1;
  });

  // THE MOST UNREADABLE PART OF THE CODE
  Q.scene("stage_select", function(stage) {

    stage.val = 0;
    stage.mode = 0;
    stage.prefmode = 0;
    stage.unlocked = 0;
    stage.unlockedb = 0;
    stage.names = ["---", "WORLD 1", "STAGE 2", "LEVEL 3",
      "NEAT WORLD", "FIRST BLOOD", "COLD MOUNTAINS",
      "HIDDEN BASE", "STRANGE", "MORE HELL", "DISORIENTLAND",
      "F*CK MAZE", "PIT OF F*CK", "DEATH FIGHT", "SOMETHING",
      "DEATH FIGHT 2"
    ];
    stage.nameb = ["WORLD 1-2", "WALRUS CULL", "IWBTHorse"];
    stage.somearray = ["NORMAL LEVELS", "X2 SPEED MODE", "BONUS LEVELS",
      "HARDEST SH*T"
    ]
    stage.on("step", function(dt) {

      if (this.prefmode > this.mode)
        this.mode += (Math.abs((this.mode + 0.5) % 1 - 0.5) + 0.001) *
        (dt * 20);
      else
        this.mode = this.prefmode;
      this.val += dt * 6;
    });
    stage.on("prerender", function(ctx) {
      ctx.fillStyle = "hsl(" + (Math.floor(this.val * 20) % 360) +
        ", 100%, 5%)";
      ctx.fillRect(0, 0, 800, 600);
      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.strokeStyle = "rgb(255, 255, 255)";
      ctx.lineCap = "square";
      ctx.lineWidth = 4;
      ctx.font = "32px 'Press Start 2P'";
      ctx.textAlign = "center";
      ctx.fillText(this.somearray[Math.floor(this.mode) % 4], 400, 40);
      ctx.setTransform(1, 0, 0, 1, ((this.mode + 0.5) % 1 - 0.5) * 2 *
        800, -20);

      // or just use a transformation

      stage.mouseov = -1;

      if (Q.inputs.mouseY < 400 && Q.inputs.mouseY > 100 && Math.abs(
          400 - Q.inputs
          .mouseX) < 250 && this.mode % 1 == 0) {
        stage.mouseov = Math.floor((Q.inputs.mouseX - 150) / 100) +
          Math.floor((Q.inputs.mouseY - 100) / 100) * 5;
      }

      var eggs = 0;
      var noice = Q.asset("noice.png");
      for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 3; j++) {
          eggs = i + j * 5;

          // same noise techneek as in Boundless Power: Wulawula massacre, Electric fence bonus map
          ctx.drawImage(noice, Math.floor(Math.random() * 20), Math.floor(
              Math.random() * 10), 5, 10,
            i * 100 + 150, j * 100 + 120, 100, 100);
          if (eggs == stage.mouseov) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            ctx.fillRect(i * 100 + 150, j * 100 + 120, 100, 100);
            ctx.fillStyle = "rgb(255, 255, 255)";
          }
          ctx.strokeRect(i * 100 + 150, j * 100 + 120, 100, 100);
          if (((this.mode + 0.5) % 4 >= 2 && eggs <= 2) || ((this.mode +
              0.5) % 4 <= 2))
            ctx.fillText( // Code readability: (0 + 2)/10
              
              // Determine what should be drawn in the level button
              // Compare current level with levels unlocked
              // Check for x2 mode, if so, then use it's # of levels unlocked instead
              (eggs <= ((Math.floor(this.mode + 0.5) % 2 != 0) ? this.unlockedb
                                                               : this.unlocked))
                // Also check if bonus levels are selected
                || ((this.mode + 0.5) % 4 >= 2)
                  ? (eggs + 1) // Draw the index of the level, arrays don't start at 1
                  : "-", // Draw a dash for locked or invalid level
              
              // Draw text in the right place
              i * 100 + 50 + 150, // X position
              j * 100 + 120 + 35 // Y position
                // Slowly move up and down for aesthetic
                + Math.sin(this.val / 3 + eggs / 2) * 3);
        }
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      if (stage.mode == Math.floor(stage.mode)) {
        ctx.drawImage(Q.asset("arrow.png"), 680 + Math.sin(this.val *
          Math.PI / 4) * 4, 220, 64, 64);
        if (Math.sqrt(Math.pow(Q.inputs.mouseY - (220 + 32), 2) +
            Math.pow(Q.inputs.mouseX - (680 + 32), 2)) < 32) {
          ctx.fillStyle = "rgb(255, 255, 255)";
          ctx.textAlign = "left";
          ctx.font = "8px 'Press Start 2P'";
          ctx.fillText("NOPE,", 5, 510);
          ctx.fillText("THIS BUTTON  --->", 5, 520);
        }
      }

      var neat = 0;

      ctx.font = "24px 'Press Start 2P'";
      ctx.textAlign = "left";
      neat = this.satadata[2 * (Math.floor(this.mode + 0.5) % 2 != 0) +
        3 + 4 * this.mouseov + (4 * 15) * ((this.mode + 0.5) % 4 >=
          2)];
      ctx.fillText("HRSEDEATH: " + ((this.mouseov == -1 || neat ==
          "-1" || neat == undefined || neat == "") ? "---" : neat),
        166, 414);
      neat = this.satadata[2 * (Math.floor(this.mode + 0.5) % 2 != 0) +
        4 + 4 * this.mouseov + (4 * 15) * ((this.mode + 0.5) % 4 >=
          2)];
      ctx.fillText("FISHDEATH: " + ((this.mouseov == -1 || neat ==
          "-1" || neat == undefined || neat == "") ? "---" : neat),
        166, 414 + 48);
      ctx.fillText(((this.mode + 0.5) % 4 < 2) ? this.names[this.mouseov +
        1] : this.nameb[this.mouseov], 166 + 48 * 2, 414 + 48 * 2);
      ctx.strokeRect(150, 400, 500, 48 * 3);
    });

    stage.insert(new Q.UI.Button({
      x: 150 + 24,
      y: 520,
      scale: 2,
      border: 2,
      radius: 0,
      stroke: "white",
      asset: "button0.png"
    })).on("click", function() {
      stage.prefmode++;
      Q.audio.play("switch.ogg");
      //Q.audio.stop();
      //Q.clearStages();
      //Q.stageScene(lastlevel);
    });

    stage.insert(new Q.UI.Button({
      x: 150 + 24 + 48,
      y: 520,
      scale: 2,
      border: 2,
      radius: 0,
      stroke: "white",
      asset: "button1.png"
    })).on("click", function() {
      Q.audio.stop();
      Q.audio.play("switch.ogg");
      Q.clearStages();
      Q.stageScene("menu");
    });

    stage.insert(new Q.UI.Button({
      x: 400,
      y: 300,
      w: 800,
      h: 600,
      border: 0,
      radius: 0,
      fill: "rgba(0, 0, 0, 0)"
    })).on("click", function() {
      if (stage.mouseov != -1 && stage.mode == stage.prefmode) {
        Q.audio.play("switch.ogg");
        if ((stage.mouseov <= ((Math.floor(stage.mode + 0.5) % 2 != 0) ?
            stage.unlockedb : stage.unlocked)) || ((stage.mode + 0.5) %
            4 >= 2)) {
          if (stage.mode % 4 < 2) {
            // x2 mode
            ponedeath = 0;
            fishdeath = 0;
            if (stage.mouseov != 0) {
              ponedeath = parseInt(stage.satadata[2 * (Math.floor(
                stage.mode + 0.5) % 2 != 0) + 3 + 4 * (stage.mouseov -
                1)]);
              fishdeath = parseInt(stage.satadata[2 * (Math.floor(
                stage.mode + 0.5) % 2 != 0) + 4 + 4 * (stage.mouseov -
                1)]);
            }
            timescale = 1 + (stage.mode % 2 != 0);
            level(stage.mouseov + 1);
          } else if (stage.mouseov <= 2) { // Not efficient?
            ponedeath = 0;
            fishdeath = 0;
            timescale = 1 + (stage.mode % 2 != 0);
            level("b" + (stage.mouseov + 1));
          }
        }
      }
      //if (Q.inputs.mouseY < 512 && Q.inputs.mouseY > 384) {
      //	this.arrimapirate[Math.floor((Q.inputs.mouseY - 384) / 32)]();
      ///}
    });

    stage.satadata = datasave.split(" ");
    stage.unlocked = parseInt(stage.satadata[1]);
    stage.unlockedb = parseInt(stage.satadata[2]);

    Q.audio.play("200BITSELECT.ogg", {
      loop: true
    });
  });

  // The DISCLAIMER
  Q.scene("warning", function(stage) {

    // MSG, BTN

    var chemicalsoup = stage.insert(new Q.UI.Container({
      x: Q.width * 0.5,
      y: Q.height * 0.5,
      fill: "rgba(0,0,0,0.0)"
    }));
    var monosodiumgranite0 = chemicalsoup.insert(new Q.UI.Text({
      x: 0,
      y: -240,
      color: "white",
      label: "DISCLAIMER"
    }));
    var monosodiumgranite1 = chemicalsoup.insert(new Q.UI.Text({
      x: 5,
      y: -200,
      color: "white",
      label: "WARNING ALERT"
    }));
    var monosodiumgranite2 = chemicalsoup.insert(new Q.UI.Text({
      x: 0,
      y: 0,
      align: "center",
      color: "white",
      size: 16,
      label: "200 FISH FISH" +
        "\n" + sillyversion + " (" + moreversion + ")" +
        "\n--------------------------" +
        "\n!! EPILEPSY WARNING !!" +
        "\nBRAIN CELL WARNING" +
        "\nMAKES NO SENSE WARNING" +
        "\nNICE LIGHTING WARNING" +
        "\nPROFANITY WARNING" +
        "\nSTRANGE GAME WARNING" +
        "\nVOLUME WARNING" +
        "\nVULGAR PONY WARNING" +
        "\n--------------------------" +
        "\nTHIS GAME CAN TRIGGER SEIZURES." +
        "\nYOU MAY NEVER SEE 'SWEETIE BELLE'" +
        "\nTHE SAME WAY. THE BACKGROUND STILL" +
        "\nIS A TARDIGRADE AND WILL ALWAYS BE." +
        "\nI AM NOT RESPONSIBLE FOR" +
        "\nANYTHING BAD THAT HAPPENS"
    }));

    var boronthiosulphatenitride = chemicalsoup.insert(new Q.UI.Button({
      x: 0,
      y: 200,
      border: 4,
      radius: 0,
      stroke: "white",
      fill: "rgba(0, 0, 0, 0)",
      color: "white",
      label: "                        "
    }))

    var monosodiumgranite3 = chemicalsoup.insert(new Q.UI.Text({
      x: 0,
      y: 207,
      color: "white",
      label: "GOT IT"
    }));

    boronthiosulphatenitride.fit(10, 10);

    // When GOT IT is pressed
    boronthiosulphatenitride.on("click", function() {
      Q.clearStages();
      Q.stageScene("menu");
    })

    monosodiumgranite0.fontString = "32px 'Press Start 2P'" // Do I really have to do this???
    monosodiumgranite1.fontString = "32px 'Press Start 2P'"
    monosodiumgranite2.fontString = "16px 'Press Start 2P'"
    monosodiumgranite3.fontString = "16px 'Press Start 2P'"
    boronthiosulphatenitride.fontString = "16px 'Press Start 2P'"

    chemicalsoup.fit(600, 140);

    stage.on("prerender", function(ctx) {
      ctx.drawImage(Q.asset("back_tardis.png"), 0, 0, 800, 600);
    });

    Q.audio.play("warning.ogg");
  });

  // Shows stage clear
  Q.scene("stageclear", function(stage) {

    endGame = false;
    checkpoint = -1;
    Q.gravityY = 980;

    stage.on("prerender", function(ctx) {
      ctx.drawImage(Q.asset("back_endback.png"), 0, 0, 800, 600);
      //ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.textAlign = "center";
      ctx.font = "64px 'Press Start 2P'";

      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fillText("LEVEL CLEAR", 400 + (Math.random() * 10) - 5, 40 +
        (Math.random() *
          10) - 5);
      styleRandomColor(ctx);
      ctx.fillText("LEVEL CLEAR", 400 + (Math.random() * 10) - 5, 40 +
        (Math.random() *
          10) - 5);

      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.textAlign = "left";
      ctx.font = "24px 'Press Start 2P'";
      ctx.fillText("HRSE DEATHS", 200 - 20, 200);
      ctx.fillText("FISH DEATHS", 200 - 20, 240);
      ctx.fillText("TIME LEFT", 200 - 20, 280);
      ctx.fillText("FULT", 200 - 20, 320);
      ctx.fillText("BITS (CASH)", 200 - 20, 360);

      ctx.textAlign = "right";
      ctx.fillText("" + ponedeath, 600 + 20, 200);
      ctx.fillText("" + fishdeath, 600 + 20, 240);
      ctx.fillText("" + timeleft, 600 + 20, 280);
      ctx.fillText("" + (ponedeath * fishdeath), 600 + 20, 320);
      ctx.fillText("" + bits, 600 + 20, 360);
    })

    // Add the buttons

    stage.insert(new Q.UI.Button({
      x: 400 + 80,
      y: 500,
      scale: 2,
      border: 2,
      radius: 0,
      stroke: "white",
      asset: "button0.png"
    })).on("click", function() {
      lastlevel = "stage_" + ((lastlevel.search("b") != -1) ? "b" :
        "") + (parseInt(lastlevel.split("_")[1].split("b").reverse()[
        0]) + 1)
      Q.audio.stop();
      Q.audio.play("switch.ogg");
      Q.clearStages();
      Q.stageScene(lastlevel);
    });;

    stage.insert(new Q.UI.Button({
      x: 400,
      y: 500,
      scale: 2,
      border: 2,
      radius: 0,
      stroke: "white",
      asset: "button1.png"
    })).on("click", function() {
      Q.audio.stop();
      Q.audio.play("switch.ogg");
      Q.clearStages();
      Q.stageScene("menu");
    });

    stage.insert(new Q.UI.Button({
      x: 400 - 80,
      y: 500,
      scale: 2,
      border: 2,
      radius: 0,
      stroke: "white",
      asset: "button2.png"
    })).on("click", function() {
      Q.audio.stop();
      Q.audio.play("switch.ogg");
      Q.clearStages();
      Q.stageScene(lastlevel);

    });

    // Save the game
    stage.satadata = datasave.split(" ");
    var bonus = (lastlevel.search("b") != -1);
    var neateggs = (parseInt(lastlevel.split("_")[1].split("b").reverse()[
      0]) - 1 + 15 * bonus);
    //console.log(timescale);

    if (stage.satadata[2 * (timescale == 2) + 3 + 4 * neateggs] == "-1")
      stage.satadata[2 * (timescale == 2) + 3 + 4 * neateggs] = ponedeath;
    else
      stage.satadata[2 * (timescale == 2) + 3 + 4 * neateggs] = Math.min(
        ponedeath, parseInt(stage.satadata[2 * (timescale == 2) + 3 + 4 *
          neateggs]));

    if (stage.satadata[2 * (timescale == 2) + 4 + 4 * neateggs] == "-1")
      stage.satadata[2 * (timescale == 2) + 4 + 4 * neateggs] = fishdeath;
    else
      stage.satadata[2 * (timescale == 2) + 4 + 4 * neateggs] = Math.min(
        fishdeath, parseInt(stage.satadata[2 * (timescale == 2) + 4 + 4 *
          neateggs]));

    if (timescale == 1 && neateggs == 4) {
      stage.satadata[4 + 4 * (neateggs + 1)] = fishdeath;
      stage.satadata[3 + 4 * (neateggs + 1)] = ponedeath;
      stage.satadata[1] = Math.max(neateggs + 2, parseInt(stage.satadata[
        1 + (timescale == 2)]));
      //alert("Level 6 is just evil so Level 7 is now unlocked! You should also try clicking the arrow button on the bottom left of the Level Select.");
      var chemicalsoup = stage.insert(new Q.UI.Container({
        x: Q.width * 0.5,
        y: Q.height * 0.5,
        fill: "rgba(0, 0, 0, 1.0)"
      }));
      var monosodiumgranite1 = chemicalsoup.insert(new Q.UI.Text({
        x: 5,
        y: -200,
        color: "white",
        label: "HEY THERE"
      }));
      var monosodiumgranite2 = chemicalsoup.insert(new Q.UI.Text({
        x: 0,
        y: 0,
        align: "center",
        color: "white",
        size: 16,
        label: "The next level is EVIL\nLevel 7 is now unlocked!\nSee it in the LEVEL SELECT."
      }));

      var boronthiosulphatenitride = chemicalsoup.insert(new Q.UI.Button({
        x: 0,
        y: 100,
        border: 4,
        radius: 0,
        stroke: "white",
        fill: "rgba(0, 0, 0, 0)",
        color: "white",
        label: "                        "
      }))

      var monosodiumgranite3 = chemicalsoup.insert(new Q.UI.Text({
        x: 0,
        y: 107,
        color: "white",
        label: "GOT IT"
      }));

      boronthiosulphatenitride.fit(10, 10);

      // When GOT IT is pressed
      boronthiosulphatenitride.on("click", function() {
        Q.audio.play("switch.ogg");
        setTimeout(function() {
          // too lazy for for loops
          Q.stage().items[3].destroy();
          Q.stage().items[4].destroy();
          Q.stage().items[5].destroy();
          Q.stage().items[6].destroy();
          Q.stage().items[7].destroy();
        }, 30);
      })

      monosodiumgranite1.fontString = "32px 'Press Start 2P'"
      monosodiumgranite2.fontString = "16px 'Press Start 2P'"
      monosodiumgranite3.fontString = "16px 'Press Start 2P'"
      boronthiosulphatenitride.fontString = "16px 'Press Start 2P'"

      chemicalsoup.fit(600, 140);

    }

    if (!bonus)
      stage.satadata[1 + (timescale == 2)] = Math.max(neateggs + 1,
        parseInt(stage.satadata[1 + (timescale == 2)]));
    datasave = "";
    stage.satadata.forEach(function(e, i, a) {
      datasave += e + " ";
    });
    datasave = datasave.substr(0, datasave.length - 1);
    // first time to use a foreach
    localStorage.setItem("ThatGameAboutTheFish", datasave);

    Q.audio.play("WL2_38_CLEAR.ogg", {
      loop: true
    });
  });

  // **** LEVELS

  Q.scene("stage_willy", function(stage) {
    stage.insert(new Q.Repeater({
      asset: "sky_day_high.png",
      speedX: 0.5,
      speedY: 0.2,
      type: 0
    }));
    Q.stageTMX("stage_1.tmx", stage);
    openHtop();

    stage.insert(new Q.Commipoint({
      x: 25 * 48,
      y: 8 * 48 - 64
    }));

    tmxMapSetup(stage);
    checkPointed();

    Q.audio.play("PROGSIM_EXPRESS.ogg", {
      loop: true
    });
    lastlevel = "stage_willy";
  });
}

