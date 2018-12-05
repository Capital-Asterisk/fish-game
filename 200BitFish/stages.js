/*
 * stages.js
 * Self explanatory
 */

var loadStages = function() {

	var ram = [0, 0, 0];
	var exitButton = 0;
	
	// Speed hacks
	/*Q.Stage = Q.Stage.extend({
		step: function(dt) {
			if(this.paused) { return false; }

			this.time += dt;
			this.markSprites(this.items, this.time);

			this.trigger("prestep", dt * timescale);
			this.updateSprites(this.items, dt * timescale);
			this.trigger("step", dt * timescale);

			if(this.removeList.length > 0) {
				for(var i=0,len=this.removeList.length;i<len;i++) {
					this.forceRemove(this.removeList[i]);
				}
				this.removeList.length = 0;
			}

			this.trigger('poststep',dt * timescale);
		}
	})*/

	// A hack
	Q.audio.play = function(s,options) {
		var now = new Date().getTime();

		// See if this audio file is currently being debounced, if 
		// it is, don't do anything and just return
		if(Q.audio.active[s] && Q.audio.active[s] > now) { return; }

		// If any options were passed in, check for a debounce,
		// which is the number of milliseconds to debounce this sound
		if(options && options['debounce']) {
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
		if(options && options['loop']) {
			source.loop = true;
		} else {
			setTimeout(function() {
				Q.audio.removeSound(soundID);
			},source.buffer.duration * 1000);
		}
		source.assetName = s;
		if(source.start) { source.start(0); } else { source.noteOn(0); }

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
						Q.audio.playingSounds[s[i]].playbackRate.value = timescale * Q.audio.playingSounds[s[i]].playbackRate.birds;
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
						if (confirm("Oh, you found out how to clear the save data. Reset?")) {
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

		stage.lazy = ["2", "0", "0", " ", "B", "I", "T", " ", "F", "I", "S", "H"];
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
				ctx.fillStyle = "hsl(" + (Math.floor(this.val * 70 - j * 40) % 360) +
					", 100%, 50%)";
				ctx.translate(0, -j * 4)
				for (var i = 0; i < this.lazy.length; i++) {
					// see?
					ctx.fillText(this.lazy[i], 130 + i * 48 + Math.cos(this.val + (i + j /
						1.4) / 2) * 16 * (j / 2 + 1), 72 + Math.sin(this.val + (i + j / 2) /
						2) * 16);

				}
				ctx.restore();
			}
			ctx.fillStyle = "rgb(255, 255, 255)";
			for (var i = 0; i < this.lazy.length; i++) {
				// Explaination: draw white 200 BIT FISH text
				ctx.fillText(this.lazy[i], 130 + i * 48 + Math.cos(this.val + i / 2) *
					16, 72 + Math.sin(this.val + i / 2) * 16);
			}

			ctx.font = "16px 'Press Start 2P'";
			ctx.textAlign = "center";
			ctx.save();
			ctx.translate(400, 160)
			//ctx.scale(2, 1);
			ctx.fillText("(ANNIVERSARY DRAGO VERSION)", 0, 0);
			ctx.restore();

			if (stage.fishy < 6) {
				
				ctx.fillText("PLAY GAME", 400, 394);
				ctx.fillText("LEVEL SELECT", 400, 426);
				ctx.fillText("USELESS BUTTON", 400, 458);
				ctx.fillText("READ THIS", 400, 490);
				ctx.fillText("MORE GOEMS", 400, 522);
				
				if (Q.inputs.mouseY < 544 && Q.inputs.mouseY > 384 && Math.abs(400 - Q.inputs
						.mouseX) < 200) {
					if (this.prevmouse != Math.floor(Q.inputs.mouseY / 32))
						this.randomSize = 128;
					ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
					ctx.fillRect(200 + this.randomSize / 2, Math.floor(Q.inputs.mouseY / 32) * 32, 400 - this.randomSize, 32);
					this.prevmouse = Math.floor(Q.inputs.mouseY / 32);
					this.randomSize *= 0.94;
				}
			}

			// Draw the isometric fish
			// Multiple images for thickness
			// fishd is darker than fish
			ctx.save()
			ctx.translate(400, 240 + stage.fishy + Math.sin(this.val / 2) * 10 / Math.max(1, this.fishy));
			if (Math.sin(stage.val / 6) < 0) {
				ctx.scale(-1, 1);
				ctx.rotate(Math.PI / 2);
				ctx.drawImage(Q.asset("fishd.png"), 0, 4 - 336 * Math.sin(stage.val / 6) /
					2, 96, 336 * Math.sin(stage.val / 6));
				ctx.drawImage(Q.asset("fishd.png"), 0, 2 - 336 * Math.sin(stage.val / 6) /
					2, 96, 336 * Math.sin(stage.val / 6));
				ctx.drawImage(Q.asset("fishd.png"), 0, -336 * Math.sin(stage.val / 6) /
					2, 96, 336 * Math.sin(stage.val / 6));
				ctx.drawImage(Q.asset("fishd.png"), 0, -2 - 336 * Math.sin(stage.val /
					6) / 2, 96, 336 * Math.sin(stage.val / 6));
				ctx.drawImage(Q.asset("fish.png"), 0, -4 - 336 * Math.sin(stage.val / 6) /
					2, 96, 336 * Math.sin(stage.val / 6));
			} else {
				ctx.rotate(Math.PI / 2);
				ctx.drawImage(Q.asset("fishd.png"), 0, 4 - 336 * Math.sin(stage.val / 6) /
					2, 96, 336 * Math.sin(stage.val / 6));
				ctx.drawImage(Q.asset("fishd.png"), 0, 2 - 336 * Math.sin(stage.val / 6) /
					2, 96, 336 * Math.sin(stage.val / 6));
				ctx.drawImage(Q.asset("fishd.png"), 0, -336 * Math.sin(stage.val / 6) /
					2, 96, 336 * Math.sin(stage.val / 6));
				ctx.drawImage(Q.asset("fishd.png"), 0, -2 - 336 * Math.sin(stage.val /
					6) / 2, 96, 336 * Math.sin(stage.val / 6));
				ctx.drawImage(Q.asset("fish.png"), 0, -4 - 336 * Math.sin(stage.val / 6) /
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
				Q.audio.stop();
				Q.clearStages();
				Q.stageScene("startis");
				console.log(Q.stage());
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
				window.open("http://gamejolt.com/profile/capital-asterisk/492409/games");
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
		Q.audio.play("200_BIT_FISH_INTRO.ogg");
		
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
		stage.somearray = ["NORMAL LEVELS", "X2 SPEED MODE", "BONUS LEVELS", "HARDEST SH*T"]
		stage.on("step", function(dt) {
		
			if (this.prefmode > this.mode)
				this.mode += (Math.abs((this.mode + 0.5) % 1 - 0.5) + 0.001) * (dt * 20);
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
			ctx.setTransform(1, 0, 0, 1, ((this.mode + 0.5) % 1 - 0.5) * 2 * 800, -20);
			
			// or just use a transformation
			
			stage.mouseov = -1;
			
			if (Q.inputs.mouseY < 400 && Q.inputs.mouseY > 100 && Math.abs(400 - Q.inputs
						.mouseX) < 250 && this.mode % 1 == 0) {
				stage.mouseov = Math.floor((Q.inputs.mouseX - 150) / 100) + Math.floor((Q.inputs.mouseY - 100) / 100) * 5;
			}
			
			var eggs = 0;
			var noice = Q.asset("noice.png");
			for (var i = 0; i < 5; i ++) {
				for (var j = 0; j < 3; j ++) {
					eggs = i + j * 5;
					
					// same noise techneek as in Boundless Power: Wulawula massacre, Electric fence bonus map
					ctx.drawImage(noice, Math.floor(Math.random() * 20), Math.floor(Math.random() * 10), 5, 10,
						      i * 100 + 150, j * 100 + 120, 100, 100);
					if (eggs == stage.mouseov) {
						ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
						ctx.fillRect(i * 100 + 150, j * 100 + 120, 100, 100);
						ctx.fillStyle = "rgb(255, 255, 255)";
					}
					ctx.strokeRect(i * 100 + 150, j * 100 + 120, 100, 100);
					if (((this.mode + 0.5) % 4 >= 2 && eggs <= 2) || ((this.mode + 0.5) % 4 <= 2))
						ctx.fillText( // Code readability: 0/10
							(eggs <= ((Math.floor(this.mode + 0.5) % 2 != 0) ? this.unlockedb : this.unlocked))
							|| ((this.mode + 0.5) % 4 >= 2)
							
							? (eggs + 1) : "-", i * 100 + 50 + 150, j * 100 + 120 + 35 + Math.sin(this.val / 3 + eggs / 2) * 3);
				}
			}
			ctx.setTransform(1, 0, 0, 1, 0, 0);

			if (stage.mode == Math.floor(stage.mode)) {
				ctx.drawImage(Q.asset("arrow.png"), 680 + Math.sin(this.val * Math.PI / 4) * 4, 220, 64, 64);
				if (Math.sqrt(Math.pow(Q.inputs.mouseY - (220 + 32), 2) + Math.pow(Q.inputs.mouseX - (680 + 32), 2)) < 32) {
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
			neat = this.satadata[2 * (Math.floor(this.mode + 0.5) % 2 != 0) + 3 + 4 * this.mouseov + (4 * 15) * ((this.mode + 0.5) % 4 >= 2)];
			ctx.fillText("HRSEDEATH: " + ((this.mouseov == -1 || neat == "-1" || neat == undefined || neat == "") ? "---" : neat), 166, 414);
			neat = this.satadata[2 * (Math.floor(this.mode + 0.5) % 2 != 0) + 4 + 4 * this.mouseov + (4 * 15) * ((this.mode + 0.5) % 4 >= 2)];
			ctx.fillText("FISHDEATH: " + ((this.mouseov == -1 || neat == "-1" || neat == undefined || neat == "") ? "---" : neat), 166, 414 + 48);
			ctx.fillText(((this.mode + 0.5) % 4 < 2) ? this.names[this.mouseov + 1] : this.nameb[this.mouseov], 166 + 48 * 2, 414 + 48 * 2);
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
			stage.prefmode ++;
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
				if ((stage.mouseov <= ((Math.floor(stage.mode + 0.5) % 2 != 0) ? stage.unlockedb : stage.unlocked)) || ((stage.mode + 0.5) % 4 >= 2)) {
					if (stage.mode % 4 < 2) {
						// x2 mode
						ponedeath = 0;
						fishdeath = 0;
						if (stage.mouseov != 0) {
							ponedeath = parseInt(stage.satadata[2 * (Math.floor(stage.mode + 0.5) % 2 != 0) + 3 + 4 * (stage.mouseov - 1)]);
							fishdeath = parseInt(stage.satadata[2 * (Math.floor(stage.mode + 0.5) % 2 != 0) + 4 + 4 * (stage.mouseov - 1)]);
						}
						timescale = 1 + (stage.mode % 2 != 0);
						level(stage.mouseov + 1);
					} else if (stage.mouseov <= 2) {// Not efficient?
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
		
		Q.audio.play("200BITSELECT.ogg", {loop: true});
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
			label:
			"200 BIT FISH"
			+ "\n" + sillyversion + " (" + moreversion + ")"
			+ "\n--------------------------"
			+ "\n!! EPILEPSY WARNING !!"
			+ "\nBRAIN CELL WARNING"
			+ "\nMAKES NO SENSE WARNING"
			+ "\nNICE LIGHTING WARNING"
			+ "\nPROFANITY WARNING"
			+ "\nSTRANGE GAME WARNING"
			+ "\nVOLUME WARNING"
			+ "\nVULGAR PONY WARNING"
			+ "\n--------------------------"
			+ "\nTHIS GAME CAN TRIGGER SEIZURES."
			+ "\nYOU MAY NEVER SEE 'SWEETIE BELLE'"
			+ "\nTHE SAME WAY. THE BACKGROUND"
			+ "\nIS A TARDIGRADE AND WILL ALWAYS BE."
			+ "\nI AM NOT RESPONSIBLE FOR"
			+ "\nANYTHING BAD THAT HAPPENS"
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

	// The CREDITS
	Q.scene("stage_credits", function(stage) {
		
		stage.text = " ** 200 BIT FISH README"
			+ "\n200 BIT FISH is a neat game by Capital_Asterisk"
			+ "\nFind me on mylittlegamedev, deviantart, and youtube"
			+ "\n\n ** Graphics"
			+ "\n * Tardigrade: Byron Adams"
			+ "\n * Sweetie Belle sprite: Desktop Pony Team (specific member unknown)"
			+ "\n * Unused Sweetie belle animations: StarStepPony, Botchan-MLP"
			+ "\n * Bit: MLP Vector : Bits - Princess Celestia: outlaw4rc (deviantart)"
			
			+ "\n\n ** Music Credits\n * Intro Music: Original music"
			+ "\n * Fish death music: Chopin - Funeral March (video by Roikkeli)"
			+ "\n * TARDIS: DOCTOR WHO 16-BIT INTRO (DoctorOctoroc)"
			+ "\n * Finish Level: Wario Land 2 OST 38\n(composed by Kozue Ishikawa. Published by Nintendo)"
			+ "\n * Stage 1-3: Programming Simulator Express: Menu (Original, a canceled game)"
			+ "\n * Stage 4: Sonic Adventure 7 (Non-SEGA pirate game)"
			+ "\n * Stage 5: Crazy bus (game) menu theme\nconverted to MIDI and rendered in LMMS with changes"
			+ "\n * Stage 6: Antarctic Adventure NES (Konami)"
			+ "\n * Stage 7: Spartan X / Kung-Fu Master (Nintendo, Koji Kondo)"
			+ "\n * Stage 8: Foot Little (Original, play my games)"
			+ "\n * Stage 9-10: Legend of Zelda - Oracle of Seasons Track 16\n(composed by Minako Adachi & Kyopi. Published by Nintendo)"
			+ "\n * Stage 11-12: Legend of Zelda - Oracle of Seasons Track"
			+ "\n * Stage 13: Wario Land 3 Track 43-44\n(composed by Kozue Ishikawa. Published by Nintendo)"
			+ "\n * Stage 14: RPG Maker 2003: Battle 1 (Enterbrain)"
			+ "\n * Stage 15: An old canceled game (Original, what now?)"
			+ "\n * Bonus 3: Conquest of the Crystal Palace: Stage 1 (I have no clue)"
			+ "\n * Secret: Electric Fence: the forest\n(Original, Unreleased game)"
			+ "\n * Music Right now: Electric Fence: Menu (Original, Unreleased game)"
			+ "\n * : Electric Fence: Menu (Original, Unreleased game)"
			
			+ "\n\n ** Fonts"
			+ "\nCopyright (c) 2012, Cody 'CodeMan38' Boisclair (cody@zone38.net)\nwith Reserved Font Name 'Press Start 2P'"
			+ "\nThis Font Software is licensed under the SIL Open Font License, Version 1.1."
			+ "\nThis license is copied below, and is also available with a FAQ at:"
			+ "\nhttp://scripts.sil.org/OFL"

			+ "\n\nCopyright (c) 2011 by Brian J. Bonislawsky DBA Astigmatic (AOETI)"
			+ "\n(astigma@astigmatic.com), with Reserved Font Names 'Righteous'"
			+ "\nThis Font Software is licensed under the SIL Open Font License, Version 1.1."
			+ "\nThis license is copied below, and is also available with a FAQ at:"
			+ "\nhttp://scripts.sil.org/OFL"
			
			+ "\n\n ** Software used (by the way)\nGame engine: Quintus HTML5 game engine"
			+ "\n * Text editing and programming: gedit, Kate, & Mousepad (no IDE used)"
			+ "\n * Music Composition: LMMS, Famitracker\nGraphics: Gimp, Krita"
			+ "\n * Additionally: Tiled (Map design)"
			+ "\n * Operating System: Linux Mint, ChromeOS, Xubuntu, GalliumOS"
			+ "\n\nIf I missed anything, let me know.".replace(/\r?\n/g, '<br />');
		
		var chemicalsoup = stage.insert(new Q.UI.Container({
			x: Q.width * 0.5,
			y: Q.height * 0.5,
			fill: "rgba(0, 0, 0, 0)"
		}));
		/*var monosodiumgranite = stage.insert(new Q.UI.Text({
			x: 500,
			y: 300,
			align: "center",
			color: "white",
			size: 16,
			label: "wooooooooot"
			
		}));*/

		var boronthiosulphatenitride = chemicalsoup.insert(new Q.UI.Button({
			x: 0,
			y: 230,
			border: 4,
			radius: 0,
			stroke: "white",
			fill: "rgba(0, 0, 0, 0)",
			color: "white",
			label: "                        "
		}))

		var monosodiumgranite3 = chemicalsoup.insert(new Q.UI.Text({
			x: 0,
			y: 237,
			color: "white",
			label: "EXIT"
		}));

		boronthiosulphatenitride.fit(10, 10);

		var area = document.createElement("textarea");
		area.style.position = "absolute";
		area.style.top = "18%";
		area.style.left = "15%";
		area.style.width = "70%";
		area.style.height = "60%";
		area.readOnly = true;
		area.style.background = "transparent";
		area.style.color = "white";
		area.style.borderStyle = "solid";
		area.style.borderWidth = 4;
		area.style.borderColor = "white";
		area.style.font = "10px 'Press Start 2P'"
		area.style.lineHeight = "130%"
		area.value = stage.text;

		document.body.appendChild(area);

		// When GOT IT is pressed
		boronthiosulphatenitride.on("click", function() {
			Q.clearStages();
			Q.audio.stop();
			document.body.removeChild(area);
			Q.stageScene("menu");
		});

		monosodiumgranite3.fontString = "16px 'Press Start 2P'";
		boronthiosulphatenitride.fontString = "16px 'Press Start 2P'";
		chemicalsoup.fit(600, 140);

		stage.offset = 0;
		//stage.velo = 0;
		stage.same = 0;
		stage.on("step", function(dt) {
			/*monosodiumgranite.p.label = "";
			for (var i = Math.floor(stage.offset); i < Math.min(Math.floor(stage.offset) + 25, stage.text.length); i ++) {
				monosodiumgranite.p.label += stage.text[i] + "\n";
			}

			if (Q.inputs["left"]) {
				stage.velo -= 0.1;
			}
			if (Q.inputs["right"]) {
				stage.velo += 0.1;
			}
			stage.same = stage.offset;
			stage.offset = Math.min(Math.max(stage.offset + stage.velo, 0), stage.text.length - 25);

			if (stage.same == stage.offset) {
				stage.velo = 0;
			}
			
			stage.velo *= 0.9;*/
		});
		
		stage.on("prerender", function(ctx) {
			ctx.fillStyle = "hsl(" + (Math.floor(stage.time * 20 * 6) % 360) +
				", 100%, 5%)";
			ctx.fillRect(0, 0, 800, 600);
			ctx.fillStyle = "rgb(255, 255, 255)";
			ctx.font = "32px 'Press Start 2P'";
			ctx.textAlign = "center";
			ctx.fillText("TEXT DOCUMENT", 400, 40);
			//ctx.drawImage(Q.asset("creditarrows.png"), 0, 0);
			//ctx.drawImage(Q.asset("back_tardis.png"), 0, 0, 800, 600);
		});

		Q.audio.play("EFMENU2.ogg", {loop: true});
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
			ctx.fillText("LEVEL CLEAR", 400 + (Math.random() * 10) - 5, 40 + (Math.random() *
				10) - 5);
			styleRandomColor(ctx);
			ctx.fillText("LEVEL CLEAR", 400 + (Math.random() * 10) - 5, 40 + (Math.random() *
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
			lastlevel = "stage_" + ((lastlevel.search("b") != -1) ? "b" : "") + (parseInt(lastlevel.split("_")[1].split("b").reverse()[0]) + 1)
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
		var neateggs = (parseInt(lastlevel.split("_")[1].split("b").reverse()[0]) - 1 + 15 * bonus);
		//console.log(timescale);
		
		if (stage.satadata[2 * (timescale == 2) + 3 + 4 * neateggs] == "-1")
			stage.satadata[2 * (timescale == 2) + 3 + 4 * neateggs] = ponedeath;
		else
			stage.satadata[2 * (timescale == 2) + 3 + 4 * neateggs]
			= Math.min(ponedeath, parseInt(stage.satadata[2 * (timescale == 2) + 3 + 4 * neateggs]));
		
		if (stage.satadata[2 * (timescale == 2) + 4 + 4 * neateggs] == "-1")
			stage.satadata[2 * (timescale == 2) + 4 + 4 * neateggs] = fishdeath;
		else
			stage.satadata[2 * (timescale == 2) + 4 + 4 * neateggs]
			= Math.min(fishdeath, parseInt(stage.satadata[2 * (timescale == 2) + 4 + 4 * neateggs]));
		
		if (timescale == 1 && neateggs == 4) {
			stage.satadata[4 + 4 * (neateggs + 1)] = fishdeath;
			stage.satadata[3 + 4 * (neateggs + 1)] = ponedeath;
			stage.satadata[1] = Math.max(neateggs + 2, parseInt(stage.satadata[1 + (timescale == 2)]));
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
				label:
				"The next level is EVIL\nLevel 7 is now unlocked!\nSee it in the LEVEL SELECT."
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
			stage.satadata[1 + (timescale == 2)] = Math.max(neateggs + 1, parseInt(stage.satadata[1 + (timescale == 2)]));
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

	// RIP MATH
	Q.scene("ripfish", function(stage) {
		//stage.on("hit", "renderi");
		//stage.on("step", "stepi");
		// it seems quintus needs more functionality
		// This is any key press
		setTimeout(function() {
		var old = Q.el.onkeydown;
			Q.el.onkeydown = function(e) {
				if (stage.sad2 == 2) {
					Q.audio.stop();
					Q.clearStages();
					Q.stageScene(lastlevel);
					Q.el.onkeydown = old;
				} else {
					stage.sad2 = 2;
					stage.sad1 = 2;
					stage.sad0 = 1;
				}
			};
		}, 1000);
		stage.sad0 = 0;
		stage.sad1 = 0;
		stage.sad2 = 0;
		stage.on("step", function(dt) {

			if (this.sad2 != 2) {
				this.sad1 += dt / 3.2;
				this.sad0 = Math.max(1, Math.min(2, 1 + Math.cos(this.sad1)));
				if (this.sad0 == 1) {
					this.sad2 = 1;
					this.sad0 = Math.max(0.5, Math.min(3, 1 + Math.cos(this.sad1))) * 2;
					if (this.sad0 == 1) {
						this.sad2 = 2;
						
					}
				}
			}
		});
		stage.render = function(ctx) {
			if (stage.sad2 == 0) {
				//ctx.fillRect(0, 0, 500, 200);
				ctx.drawImage(Q.asset("ripfish.png"), -400 * this.sad0 + 400, -300 *
					this.sad0 + 300, 800 * this.sad0, 600 * this.sad0);
			} else {
				ctx.drawImage(Q.asset("ripfish_back.png"), -400 * this.sad0 + 400, -300 *
					this.sad0 + 300, 800 * this.sad0, 600 * this.sad0);
				ctx.save();
				ctx.rotate(Math.random() / 7)
				ctx.drawImage(Q.asset("ripfish_belle.png"), -400 * this.sad0 + 400, -
					300 * this.sad0 + 300, 800 * this.sad0, 600 * this.sad0);
				ctx.restore();
			}
			if (this.sad2 == 2) {
				ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
				ctx.fillRect(0, 0, 800, 600);
				ctx.fillStyle = "rgb(255, 255, 255)";
				ctx.textAlign = "center";
				ctx.font = "32px 'Press Start 2P'";
				ctx.fillText("GAME OVER", 400, 280);
				ctx.font = "16px 'Press Start 2P'";
				ctx.fillText("The Fish Died", 400, 320);
				ctx.fillText("[any key] to retry", 400, 340);
				ctx.fillText("Don't hit space", 400, 360);
			}
		}
	});

	// THE BODY WAS NEVER RECOVERED
	Q.scene("lostfish", function(stage) {
		//stage.on("hit", "renderi");
		//stage.on("step", "stepi");
		var old = Q.el.onkeydown;
		Q.el.onkeydown = function(e) {
			Q.audio.stop();
			Q.clearStages();
			Q.stageScene(lastlevel);
			Q.el.onkeydown = old;
		};
		stage.render = function(ctx) {
			ctx.drawImage(Q.asset("ripfish_back.png"), 0, 0, 800, 600);
			ctx.save();
			ctx.rotate(Math.random() / 7)
			ctx.drawImage(Q.asset("ripfish_belle.png"), 0, 0, 800, 600);
			ctx.restore();
			ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
			ctx.fillRect(0, 0, 800, 600);
			ctx.fillStyle = "rgb(255, 255, 255)";
			ctx.textAlign = "center";
			ctx.font = "32px 'Press Start 2P'";
			ctx.fillText("GAME OVER", 400, 280);
			ctx.font = "16px 'Press Start 2P'";
			ctx.fillText("THE BODY WAS NEVER RECOVERED", 400, 320);
			ctx.fillText("[any key] to retry", 400, 340);
		}

	});

	// YOU ARE DROWNING
	Q.scene("drown", function(stage) {
		//stage.on("hit", "renderi");
		//stage.on("step", "stepi");
		var old = Q.el.onkeydown;
		Q.el.onkeydown = function(e) {
			if (stage.time > 2) {
				Q.audio.stop();
				Q.clearStages();
				Q.stageScene(lastlevel);
				Q.el.onkeydown = old;
			}
		};
		stage.render = function(ctx) {
			var eggus = Math.max(0.5, 2.5 - stage.time);
			ctx.drawImage(Q.asset("underwater.png"), -100 * eggus + (Math.random() - 0.5) * 12, -75 * eggus + (Math.random() - 0.5) * 12, 800 + 200 * eggus, 600 + 150 * eggus);
			ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
			ctx.fillRect(0, 0, 800, 600);
			ctx.fillStyle = "rgb(255, 255, 255)";
			ctx.textAlign = "center";
			ctx.font = "32px 'Press Start 2P'";
			ctx.fillText("GAME OVER", 400, 280);
			ctx.font = "16px 'Press Start 2P'";
			ctx.fillText("YOU ARE DROWNING", 400, 320);
			ctx.fillText("[any key] to retry", 400, 340);
		}
		Q.audio.play("UNDERWATER.ogg");
	});

	Q.scene("startis", function(stage) {
		//stage.on("hit", "renderi");
		//stage.on("step", "stepi");
		//port = stage.add("viewport");
		//port.centerOn(400, 300);
		Q.audio.play("WHO1620100.ogg");
		stage.life = 0;
		stage.on("step", function(dt) {
			this.life += dt;
			stage.insert(new Q.TheFishPart({x: Math.random() * 800, y: Math.random() * 600}));
			stage.insert(new Q.TheFishPart({x: Math.random() * 800, y: Math.random() * 600}));
			stage.insert(new Q.TheFishPart({x: Math.random() * 800, y: Math.random() * 600}));
			stage.insert(new Q.TheFishPart({x: Math.random() * 800, y: Math.random() * 600}));
			if (this.life > 15) {
				level(1);
				htop = "Welcome to 200 BIT FISH";
			}
		});
		stage.on("postrender", function(ctx) {
			ctx.save();
			ctx.rotate(Math.random() / 6);
			ctx.drawImage(Q.asset("tawdis.png"), 0 + Math.random() * 50 + 50, 0 +
				Math.random() * 50 + 10, 800, 600);
			ctx.restore();
			styleRandomColor(ctx);
			ctx.font = "32px 'Press Start 2P'";
			ctx.fontAlign = "center";
			ctx.fillText("GET READY", 400, 100);
			ctx.fillStyle = "rgba(255, 255, 255, " + (Math.min(1, Math.max(0, this.life -
				11.5))) + ")";
			ctx.fillRect(0, 0, 800, 600);
		});
		stage.on("prerender", function(ctx) {
			ctx.save();
			ctx.translate(400, 300);
			ctx.rotate(this.life * 30);
			ctx.drawImage(Q.asset("back_space.png"), -500, -500, 1000, 1000);
			ctx.restore();
		});

	});

	// **** LEVELS

	Q.scene("stage_1", function(stage) {
		stage.insert(new Q.Repeater({
			asset: "sky_day_high.png",
			speedX: 0.5,
			speedY: 0.2,
			type: 0
		}));
		Q.stageTMX("stage_1.tmx", stage);
		openHtop();
		
		textBox(stage, 230, 1380, 7, 80,
			"Welcome to 200 BIT FISH\nUse [A, D] or Arrow keys\nto move. Don't let the\nfish touch anything.\nDon't Press Space yet"
		);
		textBox(stage, 820, 1950, 7, 80,
			"As you see, there\nis NO JUMP.\nRIGHT - LEFT: [K/L]\nLEFT - RIGHT: [N/M]\nUse both rockets to go\nup and balance.\nDo not face the wall"
		);
		textBox(stage, 1224, 430, 7, 80,
			"See? That wasn't so hard?\nUse rockets to hover across\nthe hole on the right."
		);
		textBox(stage, 2256, 288, 7, 80,
			"Now use rockets to slow\nyour fall down this cliff\nso you don't die again."
		);
		textBox(stage, 2832, 1776, 7, 80,
			"Great, you reached the end.\n Now use space to drop the\nfish into the bucket."
		);
		stage.insert(new Q.Commipoint({
			x: 25 * 48,
			y: 8 * 48 - 64
		}));
			
		tmxMapSetup(stage);
		checkPointed();
		
		Q.audio.play("PROGSIM_EXPRESS.ogg", {
			loop: true
		});
		lastlevel = "stage_1";
	});

	Q.scene("stage_2", function(stage) {
		stage.insert(new Q.Repeater({
			asset: "sky_day_high.png",
			speedX: 0.5,
			speedY: 0.2,
			type: 0
		}));
		Q.stageTMX("stage_2.tmx", stage);
		textBox(stage, 44 * 48, 34 * 48, 7, 120,
			"You can toss the fish.\nTurn and hit [DROP FISH]\nwhile the fish is swinging"
		);
		textBox(stage, 46 * 48, 2 * 48, 7, 80, "Welcome back :D");
		textBox(stage, 61 * 48, 2 * 48, 7, 70, "Don't face\nthe walls");

		stage.insert(new Q.Commipoint({
			x: 12 * 48,
			y: 18 * 48 - 64
		}));

		tmxMapSetup(stage);
		checkPointed();

		Q.audio.play("PROGSIM_EXPRESS.ogg", {
			loop: true
		});
		lastlevel = "stage_2";
	});

	Q.scene("stage_3", function(stage) {

		stage.on("step", function(dt) {
			if (Q("AdorableHorse").first().p.landed && Math.abs(Q("AdorableHorse").first().p.y - 685) < 30 && Q("AdorableHorse").first().p.x > 2300) {
				htop = "wat...";
				openHtop();
			}
		});

		stage.insert(new Q.Repeater({
			asset: "sky_day_high.png",
			speedX: 0.5,
			speedY: 0.2,
			type: 0
		}));
		Q.stageTMX("stage_3.tmx", stage);
		textBox(stage, 8 * 48, 38 * 48, 7, 120,
			"Well, it seems you are on your own\nGood Luck and don't kill the fish!"
		);

		stage.insert(new Q.Commipoint({
			x: 36 * 48,
			y: 8 * 48 - 64
		}));

		stage.insert(new Q.Commipoint({
			x: 17 * 48,
			y: 19 * 48 - 64
		}));

		tmxMapSetup(stage);
		checkPointed();

		Q.audio.play("PROGSIM_EXPRESS.ogg", {
			loop: true
		});
		lastlevel = "stage_3";
	});

	Q.scene("stage_4", function(stage) {
		stage.on("prerender", function(ctx) {
			ctx.fillStyle = "rgb(96, 241, 232)";
			ctx.fillRect(0, 0, 800, 600);
		});
		stage.on("render", function(ctx) {
			ctx.drawImage(Q.asset("ntwb.png"), 240, 1470);
		});

		Q.stageTMX("stage_4.tmx", stage);
		textBox(stage, 2352, 1632, 7, 80,
			"all you had to do was drop the\nfish into that hole near the start.");

		stage.insert(new Q.Commipoint({
			x: 2 * 48,
			y: 24 * 48 - 64,
			angle: 190
		}));

		stage.insert(new Q.Commipoint({
			x: 28 * 48,
			y: 26 * 48 - 64,
			angle: 10
		}));

		tmxMapSetup(stage);
		checkPointed();

		Q.audio.play("SANIC7.ogg", {
			loop: true
		});
		lastlevel = "stage_4";
	});

	Q.scene("stage_5", function(stage) {
		var oldRender = stage.render;
		var cutscene = doCutScene({
			pages: ["cs/stg5_0.png", "cs/stg5_1.png"],
			text: [
				"Hi, my name is BUNDLE. Did you really think that was the real bucket? No? lol lol olol ol olll lolo lllol ololl lol olol lo loolo lol oll ol lo oll olo lolo ll o lol lo lo olo lolo ll ololololo l ol olol ol ol o lo lo lol ololo lolol olo lol olol olo lo lo lol ol o lo lo l ol olo lo l olol olololol o olol ol lol ol ol o lo lo lo lo lo lolol olol olol olo lol olo lol ol olo lolo l olo lolo lololol lolol ololo lololol l lol lol olo ol ol ollo lololo lo lol l olo lol ol ol ol ol ol olo lollolol ololo i will fuck your fish lo lololo lol olo lol lol olo lolo lol olol ol l ol olo lo lo lol ol ol olo lololol ololo lol o l olo lo lololololo lo lololo lolol ol ololo lolollo lol ol olol lo lol ol ollo lolo lol olo lol ol olo l oo lo lol olol ol ol ololol ol ol ol ol olo lo lol ol olo lo lo lo lol ol ol ol ol ol ol ol ol ol ol ol ol ol ol ol ol o lo llololololo olo olo lo lo lol ol o lo lolol olo lolo lol ol ol olo lo lolol ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha you cant catch me.",
				"!!!!OH MAGICAL EQUESTRIAN HORSE SHIT!!!! WHAT NOW?"
			]
		}, function() {
			stage.pressing = false;
			stage.pressed = -300;
			stage.fucked = false;
			stage.render = oldRender;
			stage.on("step", function(dt) {
				if (!stage.fucked) {
					if (!stage.pressing && Q("AdorableHorse").first().p.x > 2632) {
						// start the press
					
						Q.audio.play("press.ogg");
					
						stage.pressing = true;
					}
				
					if (stage.pressing) {
						var horse = Q("AdorableHorse").first();
						horse.p.x = 2636;
						horse.p.y = 157;
						horse.p.av = 0;
						horse.p.vx = 0;
						horse.p.vy = 0;
						horse.angle = 0;
						stage.pressed += dt * 20;
						if (stage.pressed > -190) {
							Q.audio.stop("press.ogg");
							Q.audio.play("namsplat.ogg");
							stage.fucked = true;
							Q("Bundle").first().collision({obj: horse});
						}
					}
				}
			});
			stage.on("prerender", function(ctx) {
				tileBack(ctx, stage, "sky_bricks.png", -stage.time * 64, Math.sin(stage.time) * 50, 0, 0, 32, 32);
				ctx.drawImage(Q.asset("hydraulic.png"), -port.viewport.x + 2750, -port.viewport.y + stage.pressed, 256, 512);
			});
			
			Q.stageTMX("stage_5.tmx", stage);
			stage.insert(new Q.Commipoint({
				x: 24 * 48,
				y: 8 * 48 - 64
			}));
			tmxMapSetup(stage, true);
			stage.insert(new Q.Bundle({
				x: 58 * 48,
				y: 288
			}));
		});
		stage.render = function(ctx) {
			cutscene.render(ctx);
		};
		lastlevel = "stage_5";
		Q.audio.play("CRAZYBUS.ogg", {
			loop: true
		});
	});

	Q.scene("stage_6", function(stage) {
		var oldRender = stage.render;
		var cutscene = doCutScene({
			pages: ["cs/stg6_0.png", "cs/stg6_0.png"],
			text: [
				"Bundle has escaped to a secret US ARMY NASA AIRFORCE HAARP NSA 51 Facility up on the mountains that were in the background.",
				"Go get that fish! Climb to sea level!"
			]
		}, function() {
			stage.render = oldRender;

			Q.stageTMX("stage_6.tmx", stage);
			tmxMapSetup(stage, true);
			var horse = Q("AdorableHorse").items[0];

			stage.insert(new Q.UI.Button({
				x: 24,
				y: 24,
				w: 48,
				h: 48,
				fill: "rgba(103, 255, 0, 0.06)",
				radius: 0
			})).on("click", function() {
				htop = "YOU HAVE PRESSED THE BUTTON OF SUPER HACKS, YOU GOT HACKED!?!?!!?!?!?!?";
				Q("AdorableHorse").first().p.walkspeed *= 2;
				if (Q("AdorableHorse").first().p.walkspeed > 1200) {
					Q("AdorableHorse").first().p.y = 3900;
				}
				openHtop();
				stage.oldTimescale = timescale;
				//timescale = 20;
			});

			//console.log(rep);
			stage.on("prerender", function(ctx) {
				ctx.drawImage(Q.asset("sky_mountain.png"), 0 + stage.viewport.x *
					0.4, 0 + stage.viewport.y * 0.4, 384 * 6, 540 * 6);
			});
			stage.unused = true;
			stage.snowX = 0;
			stage.snowY = 0;
			stage.on("render", function(ctx) {
				ctx.save();
				ctx.translate(-stage.viewport.x, -stage.viewport.y)
				var offsetX = stage.viewport.x * 2 + stage.snowX,
					offsetY = stage.viewport.y * 2 + stage.snowY,
					curX, curY, startX;
				curX = Math.floor(-offsetX % 512);
				if (curX > 0)
					curX -= 512;
				curY = Math.floor(-offsetY % 512);
				if (curY > 0)
					curY -= 512;

				startX = curX;
				while (curY < Q.height) {
					curX = startX;
					while (curX < Q.width) {
						ctx.drawImage(Q.asset("sky_snow.png"), Math.floor(curX + stage.viewport
							.x), Math.floor(curY + stage.viewport.y), 512, 512);
						curX += 512;
					}
					curY += 512;

				}
				Q.ctx.setTransform(1, 0, 0, 1, 0, 0);
				styleRandomColor(Q.ctx);
				Q.ctx.font = "24px 'Press Start 2P'";
				Q.ctx.fillText("ALT: " + Math.floor((4141 - horse.p.y) / 144), 10, 570);
				ctx.restore();
			});
			stage.on("step", function(dt) {
				//rep.p.y += 1;
				horse.p.ox = horse.p.x;
				horse.p.oy = horse.p.y;
				stage.snowX -= 80 * dt;
				stage.snowY -= 240 * dt;
				stage.snowX %= 512;
				stage.snowY %= 512;


				if (stage.unused && horse.p.y > 4140 && horse.p.x > 400 && Math.random() <
					0.03) {
					if (stage.oldTimescale)
						timescale = stage.oldTimescale;
					stage.unused = false;
					Q.stage().viewport.entity.unfollow();
					Q.stage().viewport.entity.centerOn(400, 300);
					stage.cutscene = doCutScene({
						pages: ["cs/stg6_1.png", "cs/stg6_1.png", "cs/stg6_1.png"],
						text: ["HAARP, TOP SECRET DO NOT ENTER",
							"Skid marks lead into the hatch.",
							"*enters the hatch to rescue fish"
						]
					}, function() {
						stage.render = oldRender;
						Q.stage().insert(new Q.EndLevel());
					});
					stage.render = function(ctx) {
						stage.cutscene.render(ctx);
					};
				}
			});
		});
		stage.render = function(ctx) {
			cutscene.render(ctx);
		};
		lastlevel = "stage_6";
		Q.audio.play("ANTARCTIC.ogg", {
			loop: true
		});
	});

	Q.scene("stage_7", function(stage) {
		var oldRender = stage.render;
		var cutscene = doCutScene({
			pages: ["cs/stg7_0.png", "cs/stg7_1.png", "cs/stg7_2.png",
				"cs/stg7_2.png", "cs/stg7_2.png", "cs/stg7_3.png",
				"cs/stg7_0.png", "cs/stg7_4.png"
			],
			text: ["wat da fuk is tat?", "WOOT, NEW WEAPON?!?!?!",
				"blank", "this is a cool asset keep admiring it", "blank",
				"nom",
				 "EXTERMINATE",
				"EXTERMINATE"
			]
		}, function() {
			stage.render = oldRender;
			stage.on("prerender", function(ctx) {
				ctx.save();
				//ctx.drawImage(Q.asset("sky_wall.png"), 0, 0, 512, 512);
				ctx.translate(-stage.viewport.x, -stage.viewport.y)
				var offsetX = stage.viewport.x * 0.8,
					offsetY = stage.viewport.y * 0.8,
					curX, curY, startX;
				curX = Math.floor(-offsetX % 512);
				if (curX > 0)
					curX -= 512;
				curY = Math.floor(-offsetY % 512);
				if (curY > 0)
					curY -= 512;

				startX = curX;
				while (curY < Q.height) {
					curX = startX;
					while (curX < Q.width) {
						ctx.drawImage(Q.asset("sky_wall.png"), Math.floor(curX + stage.viewport
							.x), Math.floor(curY + stage.viewport.y), 512, 512);
						curX += 512;
					}
					curY += 512;

				}
				ctx.restore();
			});
			var horse = Q("SpartanBelle").items[0];
			Q.stageTMX("stage_7.tmx", stage);

			stage.insert(new Q.UI.Button({
				x: 253 * 48 + 24,
				y: 1 * 48 + 24,
				w: 48,
				h: 48,
				fill: "rgba(103, 255, 0, 0.05)",
				radius: 0
			})).on("click", function() {
				htop =
					"YOU HAVE PRESSED THE BUTTON OF SUPER HACKS, I'M FIRING MY LAZER!?!?!!?!?!?!?";
				Q("SpartanBelle").first().p.shootspeed /= 2;
				Q("SpartanBelle").first().p.dualfire = true;
				openHtop()
			});

			setTimeout(function() {
				Q.audio.play("KUNGFU.ogg", {
					loop: true
				});
			}, 8000 / timescale);
			tmxMapSetup(stage, true, true);
			stage.on("step", function(dt) {
				horse = Q("SpartanBelle").items[0];
				if (horse && horse.p.syncstate == 3) {
					if (horse.landed)
						horse.p.ox = Math.min(horse.p.x + 512, 12096);
					if (Math.random() < Math.max(horse.p.vx / 9001, 0.005)) { // over 9000 funny meme
						if (stage.viewport.x < 11152) {
							// if can spawn right
							stage.insert(new Q.FastWalrus({
								x: stage.viewport.x + 900,
								y: 540
							}));
						}
					}
					if (Math.random() < Math.max(-horse.p.vx / 9001, 0.005)) {
						if (stage.viewport.x > 900) {
							// if can spawn left....
							stage.insert(new Q.FastWalrus({
								x: stage.viewport.x - 100,
								y: 540
							}));
						}
					}
					if (horse.p.y > 576) {
						stage.insert(new Q.EndLevel({
							horse: horse
						}));
						horse.destroy();
					}
				}
			});
		});
		stage.render = function(ctx) {
			cutscene.render(ctx);
		};
		lastlevel = "stage_7";
	});


	Q.scene("stage_8", function(stage) {
		var oldRender = stage.render;
		var cutscene = doCutScene({
			pages: ["cs/stg8_0.png", "cs/stg8_0.png", "cs/stg8_0.png", "cs/stg8_0.png"],
			text: [
				"Hi, I didn't see you there.",
				"Actually, I did.",
				"Capital_Asterisk here, well... just the OC that might have been named Captain Asterisk because that is "
				+ "probably what you thought. You made it pretty far in this game."
				+ " The rest of the game is suppose to be stages 13, 14, and 15 but I decided to extend it since there"
				+ " wasn't enough gameplay. This game is created on August 29 2015 using a somewhat undocumented game engine."
				+ " My plan was to release the game in November 28 of the same year, how neat? Are you from MLGD becuase"
				+ " if you are then there's a chance I am talking to myself. Did you know there is a #67ff00 button in"
				+ " some levels that give amazing hacks like make you run very fast and die on wall impact, but if you"
				+ " keep pressing that one then you get teleported to sea level. If you think I stole the rotating text"
				+ " from Undertale then you havn't played Pokemon Puzzle Challenge yet. So here's some information on"
				+ " what happened when getting music for this game. Most of the songs were suppose to be unfamiliar to"
				+ " most. RC88's music is really neat, but it's too much of a pony platformer. Take note of that spam on"
				+ " 1, 4, and 8 of the playlist on THAT game that I swear I did not create. I know there is plenty of"
				+ " evidence that I did and I am aware of that. The first song of the first level was from an unfinished"
				+ " pygame where the OC from the second last level was to make the first appearance. The rest of the music"
				+ " in this game are from other games that I played in the past, mostly gbc and nes with exceptions."
				+ " I am now afraid of being copyright striked. Now let's extend"
				+ " this dialogue even more. Add more dev stories! This dialogue was not this long before. The last time"
				+ " this (PART OF) dialogue was edited was a day before Hitler's birthday. Theres a secret button in 13 as well;"
				+ " it's the hardest to find. WOAH, I USED A SEMICOLON THAT WASN'T IN CODE! WOW! This game is not inspired"
				+ " by Fluttergame; in fact, this game is more inspired by Sunky the game somehow, but not that much."
				+ " The very base of this game was a very old and abandoned project known as ERAoP, EPIC RANDOM ADVENTURE"
				+ " OF PONIES. It was suppose to be this game but with more characters that are slightly messed up."
				+ " The game was about a human named John Portal who built a portal and ended up in a land of ponies then"
				+ " meets up with other characters like Kidney Flesh who eats other's kidneys to gain their powers."
				+ " I think that horse might be in 256 BIT FISH... or 666 BIT FISH... That game was in Java applet so it"
				+ " was pretty obsolete the moment it was created. You can actually download that game on my other profile."
				+ " Now back to this game. I had absolutely no"
				+ " plans in what to do when I first started. The rockets were actually some messed up jump code that"
				+ " I decided to keep since jumping was too generic. 'PONY' as a single word was used only 3 times. Once"
				+ " in the disclaimer and two times in this cutscene. "
				+ " July 2 2016 was when I thought this game was not enough becuase of perfectionism. Another month of work"
				+ " was put in and now it's August again. This game over a year old. Did you really read this far because"
				+ " something I have to say is that I am absolutely done with this game, as in f*ck it. This took me way too"
				+ " much time and perfectionism. I just wanted to get over it. A day after saying I am completely done, I"
				+ " secretly pushed another update where I edited this dialoge and changed one last graphic."
				+ " Ok, enough dialogue, just jump down this hole to"
				+ " get to the next bloat levels. Use rockets to slow down. Remember to land oriented more or less than"
				+ " pi/4 (45 deg) or else you DIE. Sorry desktop ponies team for gibbing your sprite.",
				"also you suck at this game after murdering the fish " + (fishdeath / 66)
				+ " times and getting " + (ponedeath / 66) + " deaths."
			]
		}, function() {
			stage.render = oldRender;
			Q.stageTMX("stage_8.tmx", stage);
			tmxMapSetup(stage, true, true);
			port.viewport.scale = 0.5;
			//textBox(stage, 1992, 200, 7, 80, "Catch the falling bits");
			var horse = Q("SpartanBelle").items[0];
			horse.p.maxY = 99999;
			stage.on("prerender", function(ctx) {
				ctx.save();
				//ctx.drawImage(Q.asset("sky_wall.png"), 0, 0, 512, 512);
				ctx.translate(-stage.viewport.x, -stage.viewport.y);
				var offsetX = stage.viewport.x * 0.8,
					offsetY = stage.viewport.y * 0.8,
					curX, curY, startX;
				curX = Math.floor(-offsetX % 512);
				if (curX > 0)
					curX -= 512;
				curY = Math.floor(-offsetY % 512);
				if (curY > 0)
					curY -= 512;

				startX = curX;
				while (curY < Q.height) {
					curX = startX;
					while (curX < 2352) {
						ctx.drawImage(Q.asset("sky_wall.png"), Math.floor(curX + stage.viewport
							.x), Math.floor(curY + stage.viewport.y), 512, 512);
						curX += 512;
					}
					curY += 512;

				}
				ctx.restore();
			});

			setTimeout(function() {
				//Q.pauseGame();
				stage.viewport.entity.unfollow();
				stage.viewport.centerOn(400, 300);
				var cutscene2 = doCutScene({
						pages: ["cs/stg8_0.png", "cs/stg8_0.png", "cs/stg8_0.png",
							"cs/stg8_0.png", "cs/stg8_0.png"
						],
						text: ["Woops", "i just don't know what went wrong.",
							"have some gibberish",
							"(t / 2 * (((t >> 4 | t) >> 8) % 11) & 255) / 4 + (t * (((t >> 5 | t) >> 8) % 11) & 100) / 2 + ((t / 4096+1) % 2 < 1) * (t / 16 & 255) / 2 + ((t / 4096) % 2 > 1) * (rand(0, 255) * ((t/16&255) < 12)) / 2; since that's broken use an alternate for rand() that is 0 to 255.",
							"ok, too hellish levels now"
						]
					},
					function() {
						//window.alert("click the button below to continue");
						stage.insert(new Q.EndLevel({
							horse: Q("SpartanBelle").first()
						}));
						stage.render = oldRender;
						//horseProg.start();
					});
				stage.render = function(ctx) {
					cutscene2.render(ctx);
				};
				Q("SpartanBelle").items[0].destroy();
			}, 9000);

		});
		stage.render = function(ctx) {
			cutscene.render(ctx);
		};
		lastlevel = "stage_8";
		Q.audio.play("FOOTLITTLE.ogg", {
			loop: true
		});
	});

	Q.scene("stage_9", function(stage) {
		var oldRender = stage.render;
		var cutscene = doCutScene({
			pages: ["cs/stg9_0.png"],
			text: [
				"Well that was STRANGE wasn't it. But hey, this place look neat, warm, and not moist."
			]
		}, function() {
			
			stage.render = oldRender;
			
			stage.insert(new Q.Bird({
				x: 87 * 48,
				y: 3 * 48
			}));

			stage.insert(new Q.Commipoint({
				x: 34 * 48,
				y: 12 * 48 - 64 - 32
			}));

			stage.insert(new Q.Commipoint({
				x: 63 * 48,
				y: 39 * 48 - 64 - 32
			}));

			Q.stageTMX("stage_9.tmx", stage);
			tmxMapSetup(stage, true);
			Q("AdorableHorse").items[0].destroy();

			var manehorse = stage.insert(new Q.SpartanBelle({
				x: stage._collisionLayers[0].p.bellex * 48,
				y: stage._collisionLayers[0].p.belley * 48,
				maxX: stage._collisionLayers[0].p.w,
				maxY: stage._collisionLayers[0].p.h,
				syncstate: 3,
				flamedeath: true
			}));
			port.follow(manehorse, {
				x: true,
				y: true
			}, {
				minX: 0,
				maxX: stage._collisionLayers[0].p.w,
				minY: 0,
				maxY: stage._collisionLayers[0].p.h
			});
			Q("Dark").items[0].p.horse = manehorse;

			stage.upover = 0;
			stage.on("step", function(dt) {
				stage.upover += dt * 15;
			});

			stage.on("prerender", function(ctx) {
				ctx.save(); // glitchhhy
				ctx.translate(stage.viewport.x, stage.viewport.y);
				tileBack(ctx, stage, "sky_ish.png", 0, 0,
								0.4, 0.4, 512, 512);
				tileBack(ctx, stage, "sky_pillar.png", 0, stage.upover,
								0.6, 0.6, 512, 512);
				ctx.restore();
			});

			stage.on("render", function(ctx) {
				var grd = ctx.createLinearGradient(0, 0, 0, 1920 - stage.viewport.y);

				grd.addColorStop(0, "rgb(0, 0, 0)");
				grd.addColorStop(1, "rgb(255, 140, 0)");
		
				ctx.globalCompositeOperation =
						"lighter";

				ctx.fillStyle = grd;
				ctx.fillRect(0, 0, 800, 600);

				ctx.globalCompositeOperation =
						"source-over";
			});

			for (var i = 0; i < 40; i++) {
				var x = stage.insert(new Q.Fireflare({
					x: Math.random() * stage._collisionLayers[0].p.w,
					y: 1880
				}));
				x.p.animationFrame = Math.floor(Math.random() * 24);
			}

			checkPointed();

			Q.audio.play("SUBROSIAN2.ogg", {
				loop: true
			});
		});
		
		stage.render = function(ctx) {
			cutscene.render(ctx);
		};
		
		lastlevel = "stage_9";
	});

	Q.scene("stage_10", function(stage) {
		var oldRender = stage.render;
		var cutscene = doCutScene({
			pages: ["cs/stg10_0.png", "cs/stg10_0.png", "cs/stg10_0.png", "cs/stg10_1.png", "cs/stg10_2.png"],
			text: [
				"SOMETHING IS WRONG",
			    "A strange feeling you have felt for almost 385 years of your life. Some part of it was missing. Something is very wrong...",
			    "This is the same place... and also...",
			    "blank", "!!!!OH MAGICAL EQUESTRIAN HORSE SHIT!!!! WHAT NOW?"
			]
		}, function() {
		  
			stage.render = oldRender;
		  
			Q.gravityY = 0;
			
			stage.insert(new Q.Bird({
				x: 87 * 48,
				y: 3 * 48
			}));

			stage.insert(new Q.Commipoint({
				x: 34 * 48,
				y: 12 * 48 - 64 - 32
			}));

			stage.insert(new Q.Commipoint({
				x: 63 * 48,
				y: 39 * 48 - 64 - 32
			}));

			Q.stageTMX("stage_9.tmx", stage);
			tmxMapSetup(stage, true);
			Q("AdorableHorse").items[0].destroy();

			var manehorse = stage.insert(new Q.SpartanBelle({
				x: stage._collisionLayers[0].p.bellex * 48,
				y: stage._collisionLayers[0].p.belley * 48,
				maxX: stage._collisionLayers[0].p.w,
				maxY: stage._collisionLayers[0].p.h,
				syncstate: 3,
				flamedeath: true
			}));
			port.follow(manehorse, {
				x: true,
				y: true
			}, {
				minX: 0,
				maxX: stage._collisionLayers[0].p.w,
				minY: 0,
				maxY: stage._collisionLayers[0].p.h
			});
			Q("Dark").items[0].p.horse = manehorse;

			stage.upover = 0;
			stage.makeBlood = function() {

				var randPos = [Math.random() * stage._collisionLayers[0].p.w,
					Math.random() * stage._collisionLayers[0].p.h];
				while ((randPos[0] < port.viewport.x + 800 + 200
					&& randPos[0] > port.viewport.x - 200
					&& randPos[1] < port.viewport.y + 600 + 200
					&& randPos[1] > port.viewport.y - 200)) {
					// is this bogo style?
					randPos = [Math.random() * stage._collisionLayers[0].p.w,
					Math.random() * stage._collisionLayers[0].p.h];
				}

				for (var i = 0; i < 4; i++) {
					stage.insert(new Q.MoreBlood({
						x: randPos[0],
						y: randPos[1],
						frame: 2 + Math.floor(Math
							.random() * 2),
						vx: Math.random() * 1000 -
							500,
						vy: Math.random() * 1000 -
							500,
						angle: Math.random() * 360,
						av: Math.random() * 80 -
							40,
						maxX: stage._collisionLayers[0].p.w,
						maxY: stage._collisionLayers[0].p.h
					}));
				}

				for (var i = 0; i < 18; i++) {
					stage.insert(new Q.MoreBlood({
						x: randPos[0],
						y: randPos[1],
						frame: 4 + Math.floor(Math
							.random() * 3),
						vx: Math.random() * 1000 -
							500,
						vy: Math.random() * 1000 -
							500,
						angle: Math.random() * 360,
						av: Math.random() * 80 -
							40,
						maxX: stage._collisionLayers[0].p.w,
						maxY: stage._collisionLayers[0].p.h
					}));
				}

				for (var i = 0; i < 12; i++) {
					stage.insert(new Q.MoreBlood({
						x: randPos[0],
						y: randPos[1],
						frame: 7 + Math.floor(Math
							.random() * 3),
						vx: Math.random() * 1000 -
							500,
						vy: Math.random() * 1000 -
							500,
						angle: Math.random() * 360,
						av: Math.random() * 80 -
							40,
						maxX: stage._collisionLayers[0].p.w,
						maxY: stage._collisionLayers[0].p.h
					}));
				}

				for (var i = 0; i < 10; i++) {
					stage.insert(new Q.MoreBlood({
						x: randPos[0],
						y: randPos[1],
						frame: 10 + Math.floor(
							Math.random() * 2),
						vx: Math.random() * 1000 -
							500,
						vy: Math.random() * 1000 -
							500,
						av: 0,
						maxX: stage._collisionLayers[0].p.w,
						maxY: stage._collisionLayers[0].p.h
					}));
				}

				for (var i = 0; i < 10; i++) {
					stage.insert(new Q.MoreBlood({
						x: randPos[0],
						y: randPos[1],
						frame: 1,
						vx: Math.random() * 1000 -
							500,
						vy: Math.random() * 1000 -
							500,
						angle: Math.random() * 360,
						av: Math.random() * 80 - 40,
						maxX: stage._collisionLayers[0].p.w,
						maxY: stage._collisionLayers[0].p.h
					}));
				}

				for (var i = 0; i < 10; i++) {
					stage.insert(new Q.MoreBlood({
						x: randPos[0],
						y: randPos[1],
						frame: 0,
						vx: Math.random() * 1000 -
							500,
						vy: Math.random() * 1000 -
							500,
						angle: Math.random() * 360,
						av: Math.random() * 80 - 40,
						maxX: stage._collisionLayers[0].p.w,
						maxY: stage._collisionLayers[0].p.h
					}));
				}
			};

			stage.on("step", function(dt) {
				stage.upover += dt * 100 * (Math.sin(stage.time) + 0.6);

				if (Math.random() < 0.01 && Q("MoreBlood").length < 200) {
					stage.makeBlood();
				}
			});

			stage.on("prerender", function(ctx) {
				ctx.save(); // glitchhhy
				ctx.translate(stage.viewport.x, stage.viewport.y);
				tileBack(ctx, stage, "sky_ish.png", 0, stage.upover,
								0.4, 0.4, 512, 512);
				tileBack(ctx, stage, "sky_pillar.png", 0, stage.upover * 3,
								0.6, 0.6, 512, 512);
				ctx.restore();
			});

			stage.on("render", function(ctx) {
				var grd = ctx.createLinearGradient(0, 0, 0, 1920 - stage.viewport.y);

				grd.addColorStop(0, "rgb(0, 0, 0)");
				grd.addColorStop(1, "rgb(255, 140, 0)");
		
				ctx.globalCompositeOperation =
						"lighter";

				ctx.fillStyle = grd;
				ctx.fillRect(0, 0, 800, 600);

				ctx.globalCompositeOperation =
						"source-over";
			});

			for (var i = 0; i < 40; i++) {
				var x = stage.insert(new Q.Fireflare({
					x: Math.random() * stage._collisionLayers[0].p.w,
					y: 1880
				}));
				x.p.animationFrame = Math.floor(Math.random() * 24);
			}

			checkPointed();

			Q.audio.play("SUBROSIAN2.ogg", {
				loop: true
			});
		});
		
		stage.render = function(ctx) {
			cutscene.render(ctx);
		};
		
		lastlevel = "stage_10";
	});


	Q.scene("stage_11", function(stage) {
		Q.gravityY = 0;
	
		stage.insert(new Q.Bird({
			x: 51 * 48,
			y: 16 * 48,
		}));

		stage.insert(new Q.Commipoint({
			x: 68 * 48,
			y: 20 * 48 - 64 - 32
		}));

		Q.stageTMX("stage_11.tmx", stage);
		tmxMapSetup(stage, true);
		Q("AdorableHorse").items[0].destroy();

		var manehorse = stage.insert(new Q.SpartanBelle({
			x: stage._collisionLayers[0].p.bellex * 48,
			y: stage._collisionLayers[0].p.belley * 48,
			maxX: stage._collisionLayers[0].p.w,
			maxY: stage._collisionLayers[0].p.h,
			syncstate: 3,
			flamedeath: true
		}));
		port.follow(manehorse, {
			x: true,
			y: true
		}, {
			minX: 0,
			maxX: stage._collisionLayers[0].p.w,
			minY: 0,
			maxY: stage._collisionLayers[0].p.h
		});
		Q("Dark").items[0].p.horse = manehorse;

		stage.upover = 0;

		stage.on("prerender", function(ctx) {
			ctx.save(); // glitchhhy
			ctx.translate(stage.viewport.x, stage.viewport.y);
			tileBack(ctx, stage, "sky_ish.png", 0, stage.upover,
							0.4, 0.4, 512, 512);
			tileBack(ctx, stage, "sky_pillar.png", 0, stage.upover * 3,
							0.6, 0.6, 512, 512);
			ctx.restore();
		});

		stage.on("render", function(ctx) {
			var grd = ctx.createLinearGradient(0, 0, 0, 1920 - stage.viewport.y);

			grd.addColorStop(0, "rgb(0, 0, 0)");
			grd.addColorStop(1, "rgb(255, 140, 0)");

			ctx.globalCompositeOperation =
					"lighter";

			ctx.fillStyle = grd;
			ctx.fillRect(0, 0, 800, 600);

			ctx.globalCompositeOperation =
					"source-over";
		});

		
		for (var i = 0; i < 40; i++) {
			var x = stage.insert(new Q.Fireflare({
				x: Math.random() * stage._collisionLayers[0].p.w,
				y: 1880
			}));
			x.p.animationFrame = Math.floor(Math.random() * 24);
		}

		checkPointed();
	
		// Spawn walruses
		for (var i = 0; i < 20; i++) {
			// Get a random position that is not close to horse
			var randPos = [Math.random() * stage._collisionLayers[0].p.w,
				Math.random() * stage._collisionLayers[0].p.h];
			while (Math.sqrt(Math.pow(randPos[0] - manehorse.p.x, 2)
				+ Math.pow(randPos[1] - manehorse.p.y, 2)) < 200) {
				randPos = [Math.random() * stage._collisionLayers[0].p.w,
								Math.random() * stage._collisionLayers[0].p.h];
			}

			stage.insert(new Q.FastWalrus({
				x: randPos[0],
				y: randPos[1],
				nodespawn: true,
				stand: true
			}));
		}

		Q.audio.play("SUBROSIAN.ogg", {
			loop: true
		});
	
		lastlevel = "stage_11";
	});

	Q.scene("stage_12", function(stage) {

		Q.gravityY = 1150;
	
		stage.insert(new Q.Bird({
			x: 88 * 48,
			y: 31 * 48,
		}));

		stage.insert(new Q.Commipoint({
			x: 42 * 48,
			y: 29 * 48 - 64 - 32
		}));

		Q.stageTMX("stage_12.tmx", stage);
		tmxMapSetup(stage, true);
		Q("AdorableHorse").items[0].destroy();

		var manehorse = stage.insert(new Q.SpartanBelle({
			x: stage._collisionLayers[0].p.bellex * 48,
			y: stage._collisionLayers[0].p.belley * 48,
			maxX: stage._collisionLayers[0].p.w,
			maxY: stage._collisionLayers[0].p.h,
			syncstate: 3,
			flamedeath: true
		}));

		port.follow(manehorse, {
			x: true,
			y: true
		}, {
			minX: 0,
			maxX: stage._collisionLayers[0].p.w,
			minY: 0,
			maxY: stage._collisionLayers[0].p.h
		});

		Q("Dark").items[0].p.horse = manehorse;

		stage.upover = 0;
		stage.spook = false;
		stage.imga = false;
		
		stage.on("step", function(dt) {
			stage.upover -= dt * 50;
			if (manehorse.p.x > 62 * 48 && manehorse.p.x < 78 * 48) {
				// SPOOK TIME
				if (!stage.spook) {
					Q.audio.play("spooked.ogg", {loop: true});
					Q.audio.play("wootspam.ogg");
				}
				Q.audio.stop("SUBROSIAN.ogg");
				stage.spook = true;
				port.viewport.scale = 0.9 + Math.random() / 3;
				htop = Math.random().toString(36).substr(2, 30) + Math.random().toString(36).substr(2, 30);
				openHtop()
			} else {
				if (stage.spook)
					Q.audio.play("SUBROSIAN.ogg", {
						loop: true
					});
				stage.spook = false;
				Q.audio.stop("spooked.ogg");
				port.viewport.scale = 1;
			}
		});


		stage.on("prerender", function(ctx) {
			ctx.save(); // glitchhhy
			ctx.translate(stage.viewport.x, stage.viewport.y);
			tileBack(ctx, stage, "sky_ish.png", 0, stage.upover,
							0.4, 0.4, 512, 512);
			tileBack(ctx, stage, "sky_pillar.png", 0, stage.upover * 3,
							0.6, 0.6, 512, 512);
			ctx.restore();
		});

		stage.on("render", function(ctx) {
			var grd = ctx.createLinearGradient(0, 0, 0, 1920 - stage.viewport.y);

			grd.addColorStop(0, "rgb(0, 0, 0)");
			grd.addColorStop(1, "rgb(255, 140, 0)");

			ctx.globalCompositeOperation =
					"lighter";

			ctx.fillStyle = grd;
			ctx.fillRect(0, 0, 800, 600);

			ctx.globalCompositeOperation =
					"source-over";

			if (stage.spook) {
				if (stage.imga) {
					ctx.drawImage(Q.asset("jumpscare.png"), -Math.random() * 50, -Math.random() * 50, 800 + Math.random() * 100, 600 + Math.random() * 100);
					stage.imga = false;
				} else 
					stage.imga = true;
			}
		});

		
		for (var i = 0; i < 40; i++) {
			var x = stage.insert(new Q.Fireflare({
				x: Math.random() * stage._collisionLayers[0].p.w,
				y: 1880
			}));
			x.p.animationFrame = Math.floor(Math.random() * 24);
		}

		checkPointed();

		Q.audio.play("SUBROSIAN.ogg", {
			loop: true
		});
	
		lastlevel = "stage_12";
	});

	Q.scene("stage_13", function(stage) {
		var oldRender = stage.render;
		var cutscene = doCutScene({
			pages: ["cs/stg13_0.png", "cs/stg13_0.png", "cs/stg13_0.png", "cs/stg13_1.png",
				"cs/stg13_1.png"
			],
			text: ["mu ha ha ha ha ha ha",
				"you will never buy that fish from me!",
				"first, you have to get through MY COOL OC", "i am THE KILLER",
				"i will fuck you up little dickhead bitch"
			]
		}, function() {
			stage.render = oldRender;

			Q.stageTMX("stage_13.tmx", stage);
			tmxMapSetup(stage, true);
			Q("AdorableHorse").items[0].destroy();
			var manehorse = stage.insert(new Q.SpartanBelle({
				x: Math.round(Math.random()) * 1152 + 192,
				y: Math.round(Math.random()) * 864 + 240,
				maxX: stage._collisionLayers[0].p.w,
				maxY: stage._collisionLayers[0].p.h,
				syncstate: 3
			}));
			port.follow(manehorse, {
				x: true,
				y: true
			}, {
				minX: 0,
				maxX: stage._collisionLayers[0].p.w,
				minY: 0,
				maxY: stage._collisionLayers[0].p.h
			});
			Q("Dark").items[0].p.horse = manehorse;
			manehorse.p.ox = Math.round(Math.random()) * 1152 + 192;
			manehorse.p.oy = Math.round(Math.random()) * 864 + 240;

			stage.insert(new Q.Killer({
				x: 16 * 48,
				y: 9 * 48
			}));

			stage.insert(new Q.UI.Button({
				x: 10 * 48 + 24,
				y: 12 * 48 + 24,
				w: 48,
				h: 48,
				fill: "rgba(103, 255, 0, 0.05)",
				radius: 0
			})).on("click", function() {
				htop =
					"YOU HAVE PRESSED THE BUTTON OF SUPER HACKS, I'M FIRING MY LAZER!?!?!!?!?!?!?";
				openHtop()
				Q("SpartanBelle").first().p.shootspeed /= 2;
			});

			//console.log(rep);
			stage.on("prerender", function(ctx) {
				ctx.drawImage(Q.asset("sky_ponycreator.png"), stage.viewport.x * 0.5,
					stage.viewport.y * 0.5, 800 * 2, 600 * 2);
			});

			stage.on("step", function(dt) {
				manehorse.p.ox = Math.round(Math.random()) * 1152 + 192;
				manehorse.p.oy = Math.round(Math.random()) * 864 + 240;

			});

			Q.audio.stop();
			Q.audio.play("RPGM2003BATTLE.ogg", {
				loop: true
			});
		});
		stage.render = function(ctx) {
			cutscene.render(ctx);
		};
		lastlevel = "stage_13";
		Q.audio.play("TADPOLEDDRD.ogg");
	});

	// This part was moved from stage 8 to a new scene
	Q.scene("stage_14", function(stage) {
		Q.stageTMX("stage_8.tmx", stage);
		tmxMapSetup(stage, true, true);
		textBox(stage, 1992, 200, 7, 80, "Catch the falling bits");
		Q("SpartanBelle").items[0].destroy();
		stage.on("prerender", function(ctx) {
			ctx.save();
			//ctx.drawImage(Q.asset("sky_wall.png"), 0, 0, 512, 512);
			ctx.translate(-stage.viewport.x, -stage.viewport.y);
			var offsetX = stage.viewport.x * 0.8,
				offsetY = stage.viewport.y * 0.8,
				curX, curY, startX;
			curX = Math.floor(-offsetX % 512);
			if (curX > 0)
				curX -= 512;
			curY = Math.floor(-offsetY % 512);
			if (curY > 0)
				curY -= 512;

			startX = curX;
			while (curY < Q.height) {
				curX = startX;
				while (curX < 2352) {
					ctx.drawImage(Q.asset("sky_wall.png"), Math.floor(curX + stage.viewport
						.x), Math.floor(curY + stage.viewport.y), 512, 512);
					curX += 512;
				}
				curY += 512;

			}
			ctx.restore();
		});
		stage.soundplay = false;
		var oldrender = stage.render;
		stage.render = function(ctx) {
			// clipped triangle wave that speeds up... i dont know what to call it...
			var e = (Math.min(0.2, Math.max(0, Math.abs((100 / (12 - stage.time) % 2) - 1) - 0.5 + 0.1))) * 800 / 0.2;
			ctx.drawImage(Q.asset("back_blank.png"), 0, 0, 800, 600);
			ctx.drawImage(Q.asset("sa_floor.png"), e, 0, 800, 600);
			Q.ctx.drawImage(Q.asset("coolifier.png"), 0, 0);
			// if resting
			if (e <= 1 || e >= 799) {
				Q.audio.stop();
				this.soundplay = false;
			} else if (!this.soundplay) {
				this.soundplay = true;
				Q.audio.play("drag.ogg");
			}
			if (this.time > 12) {
				stage.render = oldrender;
				horseProg.start();
			}
		};
		
		lastlevel = "stage_14";
		Q.audio.stop();
		//horseProg.start();
	});


	Q.scene("stage_15", function(stage) {
		var oldRender = stage.render;
		var cutscene = doCutScene({
			pages: ["cs/stg15_0.png", "cs/stg15_0.png", "cs/stg15_1.png", "cs/stg15_1.png"],
			text: [
				"You can't catch me I am going to go flying and if you do go after me I got my bricks and I am going to kill you until you are drowning and dead you small horse and when i start flying i am going to throw bricks at you.",
				"bye",
				"NOW IT'S TIME FOR YOU TO FIGHT FOR REVENGE YOUR SOLD FISH",
				"GET THE TRAWDIS AND KILL BUNDLE"
			]
		}, function() {
			stage.render = oldRender;
			var manehorse = stage.insert(new Q.Tawdis({
				x: 200,
				y: 0
			}));

			var bundle = stage.insert(new Q.FlyingFag({
				x: 736,
				y: 300
			}));

			textBox(stage, 500, 280, 7, 80,
				"GO KILL BUNDLE.\n[ANY ROCKET] To fly up\n[DROP FISH] to SPRAY"
			);
			var duck = true;

			port = stage.add("viewport");
			port.centerOn(400, 300);

			stage.boomA = 0;
			stage.boomB = 0;

			stage.oceanAX = 0;
			stage.oceanBX = 0;
			stage.oceanCX = 0;
			stage.oceanDX = 0;

			stage.oceanEX = 0;
			stage.oceanFX = 0;
			stage.oceanGX = 0;

			stage.oceanHX = 0;
			stage.oceanHY = 0;
			stage.stopeverything = false;

			stage.time = 0;// that solves it

			stage.on("step", function(dt) {
				// too lazy to do the exp math and shit
				// and why individual vars?
				this.oceanAX = Math.max(0, (stage.time) * 1000);
				this.oceanBX = Math.max(0, (stage.time) * 600);
				this.oceanCX = Math.max(0, (stage.time) * 300);
				this.oceanDX = Math.max(0, (stage.time) * 200);

				this.oceanEX = Math.max(0, (stage.time) * 1500);
				this.oceanFX = Math.max(0, (stage.time) * 700);
				this.oceanGX = Math.max(0, (stage.time) * 90);

				this.oceanHX = stage.time * 1000 + Math.max(0, stage.time * 700);
				this.oceanHY = stage.time * 1000;

				stage.boomA = Math.max(0, stage.boomA - dt * 20);
				stage.boomB = Math.max(0, stage.boomB - dt * 20);

				if (manehorse.p.cactive && duck) {
					//box.p.x = box.p.x + (box.p.x - 272) / 2;
					//box.p.cx -= 5;
					stage.items[3].destroy();
					stage.items[2].destroy();
					duck = false;
				}

				var blood = Q("MoreBlood").items;
				for (var i = 0; i < blood.length; i++) {
					if (blood[i].p.y > 500) {
						stage.insert(new Q.Splash({
							x: blood[i].p.x,
							y: 490 + Math.random() * 20,
							vx: -1000
						}));
						blood[i].destroy();
					}
				}
				if (bundle.p.health <= 0) {
					Q.stageScene("stage_ripbundle");
					Q.audio.stop();
				}
			});
			stage.on("prerender", function(ctx) {
				var grd = ctx.createLinearGradient(0, 0, 0, 360);
				grd.addColorStop(0, "rgb(35, 35, 48)");
				grd.addColorStop(1, "rgb(76, 76, 90)");

				ctx.fillStyle = grd;
				ctx.fillRect(0, 0, 800, 360);
				tileHorizontal(ctx, this, "sky_ocean.png", this.oceanDX, 360, 0, 512, 128);
				tileHorizontal(ctx, this, "sky_ocean.png", this.oceanCX, 372, 0, 512, 128);
				tileHorizontal(ctx, this, "sky_ocean.png", this.oceanBX, 400, 0, 512, 128);
				tileHorizontal(ctx, this, "sky_ocean.png", this.oceanAX, 472, 0, 512, 128);

				tileHorizontal(ctx, this, "sky_clouds.png", this.oceanGX, 48, 0, 512, 128);
				tileBack(ctx, this, "sky_rain.png", this.oceanHX / 2, -this.oceanHY / 2,
					0, 0, 256, 256); // i did it here?
				tileHorizontal(ctx, this, "sky_clouds.png", this.oceanFX, 36, 0, 512, 128);
				tileHorizontal(ctx, this, "sky_clouds.png", this.oceanEX, 0, 0, 512, 128);

				if (manehorse.p.health > 0) {
					ctx.globalCompositeOperation = "lighter";
					ctx.globalAlpha = Math.max(Math.min((manehorse.p.y - 300) / 400, 1), 0);
					ctx.drawImage(Q.asset("tardislight.png"), 0, 380);
					ctx.globalCompositeOperation = "source-over";
					ctx.globalAlpha = 1;
				}
			});
			stage.on("render", function(ctx) {
				tileBack(ctx, this, "sky_rain.png", this.oceanHX, -this.oceanHY, 0, 0,
					512, 512);
				Q.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
				Q.ctx.fillRect(0, 0, 800, 64);
				ctx.fillStyle = "hsl(" + Math.floor(manehorse.p.health / 1000 * 120) + ", 100%, 50%)";
				ctx.fillRect(10, 10, (manehorse.p.health / 1000) * 780, 22);
				ctx.fillStyle = "hsl(" + Math.floor(bundle.p.health / 100 * 120) + ", 100%, 50%)";
				ctx.fillRect(10, 32, (bundle.p.health / 100) * 780, 22);
				ctx.fillStyle = "rgb(255, 255, 255)";
				ctx.textAlign = "left";
				ctx.font = "16px 'Press Start 2P'";
				ctx.fillText("TRAWDIS HEALTH: " + manehorse.p.health, 14 + (Math.random() - 0.5) * stage.boomA, 16 + (Math.random() - 0.5) * stage.boomA);
				ctx.fillText("BUNDLEs HEALTH: " + Math.round(bundle.p.health * 10000) / 10000, 14 + (Math.random() - 0.5) * stage.boomB, 36 + (Math.random() - 0.5) * stage.boomB);
			});

			Q.audio.play("K331.ogg", {loop: true});
			Q.audio.play("jet1.ogg", {loop: true});
		});
		stage.render = function(ctx) {
			cutscene.render(ctx);
		};
		lastlevel = "stage_15";
		
		
	});
	
	// **** CELEBRATIONS

	//var memes = 300;
	Q.scene("stage_ripbundle", function(stage) {
		//stage.on("hit", "renderi");
		//stage.on("step", "stepi");
		bundledeath.play();
		bundledeath.onended = function() {
			stage.eggs = true;
			Q.audio.play("beammeme.ogg");
		}
		stage.eggs = false;
		stage.on("render", function(ctx) {
			if (!stage.eggs) {
				stage.time = 0;
				ctx.drawImage(bundledeath, 0, 0, 800, 600);
			} else {
				styleRandomColor(ctx);
				ctx.fillRect(64 - Math.sin(stage.time * 2) * 32, 0, 280 + Math.sin(stage.time * 2) * 64, 600);
				ctx.save();
				ctx.translate(308, 600 - Math.cbrt(stage.time) * 200);
				//ctx.translate(0, 0);
				ctx.rotate(Math.PI / 2);
				ctx.drawImage(Q.asset("fish.png"), 0, 0, 12 * 5, 42 * 5);
				ctx.restore();
								
				// 36
				
				if (stage.time > 36) {
					ctx.drawImage(Q.asset("bit.png"), 500, (stage.time - 36) * (stage.time - 36) * 300 - 192, 192, 192);
				}

				ctx.fillStyle = "rgb(255, 255, 255)";
				ctx.textAlign = "center";
				ctx.font = "48px 'Press Start 2P'";
				ctx.fillText("BUYING FISH", 400, 280);
				
				if (stage.time > 38) {
					Q.audio.play("proghit.ogg");
					Q.audio.play("crit.ogg");
					Q.clearStages();
					setTimeout(function() {level("youwin")}, 2000 / timescale);
				}
			}
		});
	});

	Q.scene("stage_youwin", function(stage) {
		Q.audio.play("200BITCELEBRATE.ogg", {loop: true});
		stage.fishspin = 0;
		stage.hrsespin = 0;
		stage.arrimapirate = [];
		stage.andthen = textBox(stage, 400, 800, 7, 80,
			"THE FISH WAS RECLAIMED"
			+ "\nBUNDLE is DEAD"
			+ "\nIt was time for main"
			+ "\ncharacter to CELEBRATE!"
			+ "\nThe Adorable Horse went back"
			+ "\nhome with the fish and then"
			+ "\nhad fun with the fish and then"
			+ "\nate some cake but it was not"
			+ "\nover yet. BUNDLE is dead"
			+ "\nbut the adventure is only"
			+ "\nstopped but not ended yet."
			+ "\nIt is not known when the"
			+ "\nFISH will talk in dialogue."
			+ "\nThe FISH must be RETURNED."
			+ "\nThe adventure must continue"
			+ "\nbut this time with another."
			+ "\nBut for now it's time to"
			+ "\nrest. For now it is over."
			+ "\nIt is now time for the"
			+ "\nHORSE F**KER to CHILL"
			+ "\nor maybe not, waste more"
			+ "\ntime with other game modes."
			+ "\nFinish X2 Speed mode and"
			+ "\nthe fair bonus levels."
			+ "\nOr maybe you finished them"
			+ "\nalready. Maybe the next"
			+ "\ngame would satisfy that."
			+ "\n"
			+ "\nanyways, CONGRATS"
			+ "\nYour FAULT LEVEL is"
			+ "\n" + (ponedeath * fishdeath)
			+ "\nand your TIMESCALE is " + timescale
			+ "\n"
			+ "\nYOU ARE A TERRIBLE BEING"
			+ "\n!!  THANKS FOR PLAYING  !!"
			+ "\na great game by \nCapital_Asterisk\n(play all my games)"
			+ "\n\nNow hold [RESET] to exit"
			+ "\n\n\n\n\n\n\n\n\n\npoop"
		);
		
		for (var i = 0; i < 19; i ++)
			stage.arrimapirate.push(noiceColors());

		stage.on("step", function(dt) {
			//stage.insert(new Q.TheFishPart({x: Math.random() * 800, y: Math.random() * 320}));
			//stage.insert(new Q.TheFishPart({x: Math.random() * 800, y: Math.random() * 320}));
			//stage.insert(new Q.TheFishPart({x: Math.random() * 800, y: Math.random() * 320}));
			stage.andthen.p.y = -this.time * 20 + 1360;
			//stage.insert(new Q.TheFishPart({x: Math.random() * 800, y: Math.random() * 320}));
			//stage.insert(new Q.TheFishPart({x: Math.random() * 800, y: Math.random() * 320}));
			this.fishspin += dt * 40 + Math.random() / 10;
			this.hrsespin += dt * 40 + Math.random() / 10;
		});

		stage.on("prerender", function(ctx) {
			stage.arrimapirate.unshift(noiceColors());
			stage.arrimapirate.pop();
			styleRandomColor(ctx);
			ctx.fillRect(0, 0, 800, 600);
			ctx.save();
			for (var i = 0; i < stage.arrimapirate.length; i ++) {
				ctx.translate(0, Math.pow(i, 1.2));
				ctx.fillStyle = stage.arrimapirate[i];
				ctx.fillRect(0, 300, 800, Math.pow(i + 1, 1.2));
			}
			ctx.restore();

			ctx.save();
			ctx.translate(600 + (Math.random() - 0.5) * 16, 400 + (Math.random() - 0.5) * 16);
			ctx.rotate(stage.fishspin);
			ctx.drawImage(Q.asset("fish.png"), -120 / 2, -420 / 2, 120, 420);
			ctx.restore();

			ctx.save();
			ctx.translate(200 + (Math.random() - 0.5) * 16, 400 + (Math.random() - 0.5) * 16);
			ctx.rotate(stage.hrsespin);
			ctx.scale(5, 5);
			Q.sheet("horse").draw(ctx, -50, -35, 38);
			ctx.restore();

			ctx.fillStyle = "rgb(255, 255, 255)";
			ctx.font = "48px 'Press Start 2P'";
			ctx.fillText("WIN_YOU", 400 + (Math.random() - 0.5) * 16, 250 + (Math.random() - 0.5) * 16);
			//ctx.fillText("BUYING FISH", 400, 280);
		});

		stage.on("render", function(ctx) {
			//styleRandomColor(ctx);
			
			Q.ctx.drawImage(Q.asset("coolifier.png"), 0, 0);
	
		});

		stage.satadata = datasave.split(" ");
		if (stage.satadata[2 * (timescale == 2) + 3 + 4 * 14] == "-1")
			stage.satadata[2 * (timescale == 2) + 3 + 4 * 14] = ponedeath;
		else
			stage.satadata[2 * (timescale == 2) + 3 + 4 * 14]
			= Math.min(ponedeath, parseInt(stage.satadata[2 * (timescale == 2) + 3 + 4 * 14]));
		
		if (stage.satadata[2 * (timescale == 2) + 4 + 4 * 14] == "-1")
			stage.satadata[2 * (timescale == 2) + 4 + 4 * 14] = fishdeath;
		else
			stage.satadata[2 * (timescale == 2) + 4 + 4 * 14]
			= Math.min(fishdeath, parseInt(stage.satadata[2 * (timescale == 2) + 4 + 4 * 14]));
		
		datasave = "";
		stage.satadata.forEach(function(e, i, a) {
			datasave += e + " ";
		});
		datasave = datasave.substr(0, datasave.length - 1);
		localStorage.setItem("ThatGameAboutTheFish", datasave);
		/*textBox(stage, 230, 1380, 7, 80,
			"Welcome to 200 BIT FISH\nUse [A, D] or Arrow keys\nto move. Don't let the\nfish touch anything.\nDon't Press Space yet"
		);
		textBox(stage, 820, 1940, 7, 80,
			"Same level?\nNOPE\nSUPER ULTRA HARD\nBONUS LEVEL\nHave Fun\n(This is actually very hard)"
		);

		stage.insert(new Q.Commipoint({
			x: 25 * 48,
			y: 8 * 48 - 64
		}));
			
		tmxMapSetup(stage);
		checkPointed();
		
		Q.audio.play("PROGSIM_EXPRESS.ogg", {
			loop: true
		});
		lastlevel = "stage_b1";*/
	});
	
	// **** BONUS LEVELS
		
	Q.scene("stage_b1", function(stage) {
		stage.insert(new Q.Repeater({
			asset: "sky_day_high.png",
			speedX: 0.5,
			speedY: 0.2,
			type: 0
		}));
		Q.stageTMX("stage_b1.tmx", stage);
		openHtop();
		
		textBox(stage, 230, 1380, 7, 80,
			"Welcome to 200 BIT FISH\nUse [A, D] or Arrow keys\nto move. Don't let the\nfish touch anything.\nDon't Press Space yet"
		);
		textBox(stage, 820, 1940, 7, 80,
			"Same level?\nNOPE!\nWHAT DO YOU THINK?\nTHIS IS BONUS LEVEL\nHave Fun\n(This is actually very hard)"
		);

		stage.insert(new Q.Commipoint({
			x: 25 * 48,
			y: 8 * 48 - 64
		}));
			
		tmxMapSetup(stage);
		checkPointed();
		
		Q.audio.play("PROGSIM_EXPRESS.ogg", {
			loop: true
		});
		lastlevel = "stage_b1";
	});

	Q.scene("stage_b2", function(stage) {
		Q.gravityY = 0;

		stage.insert(new Q.Commipoint({
			x: 68 * 48,
			y: 20 * 48 - 64 - 32
		}));

		Q.stageTMX("stage_11.tmx", stage);
		tmxMapSetup(stage, true);
		Q("AdorableHorse").items[0].destroy();

		var manehorse = stage.insert(new Q.SpartanBelle({
			x: stage._collisionLayers[0].p.bellex * 48,
			y: stage._collisionLayers[0].p.belley * 48,
			maxX: stage._collisionLayers[0].p.w,
			maxY: stage._collisionLayers[0].p.h,
			syncstate: 3,
			flamedeath: true
		}));
		manehorse.p.shootspeed = 0.05;

		port.follow(manehorse, {
			x: true,
			y: true
		}, {
			minX: 0,
			maxX: stage._collisionLayers[0].p.w,
			minY: 0,
			maxY: stage._collisionLayers[0].p.h
		});
		Q("Dark").items[0].p.horse = manehorse;

		stage.upover = 0;

		stage.on("prerender", function(ctx) {
			ctx.save(); // glitchhhy
			ctx.translate(stage.viewport.x, stage.viewport.y);
			tileBack(ctx, stage, "sky_ish.png", 0, stage.upover,
							0.4, 0.4, 512, 512);
			tileBack(ctx, stage, "sky_pillar.png", 0, stage.upover * 3,
							0.6, 0.6, 512, 512);
			ctx.restore();
		});

		stage.on("render", function(ctx) {
			var grd = ctx.createLinearGradient(0, 0, 0, 1920 - stage.viewport.y);

			grd.addColorStop(0, "rgb(0, 0, 0)");
			grd.addColorStop(1, "rgb(255, 140, 0)");

			ctx.globalCompositeOperation =
					"lighter";

			ctx.fillStyle = grd;
			ctx.fillRect(0, 0, 800, 600);

			ctx.globalCompositeOperation =
					"source-over";

			styleRandomColor(ctx);
			var walrus = Q("FastWalrus").length
			ctx.font = "24px 'Press Start 2P'";
			if (walrus > 50) {
				ctx.fillText("KILL " + (200 - walrus) + "/150 WALRUS" , 10, 570);
			} else {
				ctx.fillText("GET TO THE BIRD" , 10, 570);
				if (Q("Bird").length == 0) {				
					stage.insert(new Q.Bird({
						x: 51 * 48,
						y: 16 * 48,
					}));
				}
			}
		});

		
		for (var i = 0; i < 40; i++) {
			var x = stage.insert(new Q.Fireflare({
				x: Math.random() * stage._collisionLayers[0].p.w,
				y: 1880
			}));
			x.p.animationFrame = Math.floor(Math.random() * 24);
		}

		checkPointed();
	
		// Spawn walruses
		for (var i = 0; i < 200; i++) {
			// Get a random position that is not close to horse
			var randPos = [Math.random() * stage._collisionLayers[0].p.w,
				Math.random() * stage._collisionLayers[0].p.h];
			while (Math.sqrt(Math.pow(randPos[0] - manehorse.p.x, 2)
				+ Math.pow(randPos[1] - manehorse.p.y, 2)) < 200) {
				randPos = [Math.random() * stage._collisionLayers[0].p.w,
								Math.random() * stage._collisionLayers[0].p.h];
			}

			stage.insert(new Q.FastWalrus({
				x: randPos[0],
				y: randPos[1],
				nodespawn: true,
				stand: true
			}));
		}

		Q.audio.play("SUBROSIAN.ogg", {
			loop: true
		});
	
		lastlevel = "stage_b2";
	});

	Q.scene("stage_b3", function(stage) {
		stage.insert(new Q.Repeater({
			asset: "sky_stars2.png",
			speedX: 0.05,
			speedY: 0.05,
			type: 0
		}));
		stage.insert(new Q.Repeater({
			asset: "sky_stars1.png",
			speedX: 0.1,
			speedY: 0.1,
			type: 0
		}));
		stage.insert(new Q.Repeater({
			asset: "sky_stars0.png",
			speedX: 0.2,
			speedY: 0.2,
			type: 0
		}));
		Q.stageTMX("stage_b3.tmx", stage);
		openHtop();
		
		stage.insert(new Q.Commipoint({
			x: 2 * 48,
			y: 27 * 48 - 64
		}));

		stage.insert(new Q.Commipoint({
			x: 60 * 48,
			y: 46 * 48 - 64
		}));

		stage.insert(new Q.Commipoint({
			x: 5 * 48,
			y: 54 * 48 - 64
		}));
			
		stage.insert(new Q.Commipoint({
			x: 103 * 48,
			y: 54 * 48 - 64
		}));

		stage.insert(new Q.Commipoint({
			x: 122 * 48,
			y: 10 * 48 - 64
		}));

		stage.insert(new Q.Commipoint({
			x: 180 * 48,
			y: 110 * 48 - 64
		}));
		
		stage.insert(new Q.Commipoint({
			x: 167 * 48,
			y: 110 * 48 - 64
		}));

		stage.insert(new Q.Commipoint({
			x: 175 * 48,
			y: 197 * 48 - 64
		}));

		stage.insert(new Q.Commipoint({
			x: 156 * 48,
			y: 197 * 48 - 64
		}));

		stage.insert(new Q.Commipoint({
			x: 132 * 48,
			y: 152 * 48 - 64
		}));

		stage.insert(new Q.Commipoint({
			x: 133 * 48,
			y: 124 * 48 - 64
		}));

		stage.insert(new Q.Commipoint({
			x: 82 * 48,
			y: 152 * 48 - 64
		}));

		stage.insert(new Q.Commipoint({
			x: 82 * 48,
			y: 181 * 48 - 64
		}));

		stage.insert(new Q.Commipoint({
			x: 65 * 48,
			y: 174 * 48 - 64
		}));

		stage.insert(new Q.Commipoint({
			x: 41 * 48,
			y: 197 * 48 - 64
		}));

		stage.insert(new Q.Commipoint({
			x: 42 * 48,
			y: 180 * 48 - 64
		}));
		
		stage.insert(new Q.Commipoint({
			x: 16 * 48,
			y: 148 * 48 - 64
		}));
		
		stage.insert(new Q.Commipoint({
			x: 46 * 48,
			y: 133 * 48 - 64
		}));

		stage.insert(new Q.Commipoint({
			x: 73 * 48,
			y: 112 * 48 - 64
		}));	

		stage.insert(new Q.Commipoint({
			x: 68 * 48,
			y: 81 * 48 - 64
		}));

		stage.insert(new Q.Commipoint({
			x: 7 * 48,
			y: 88 * 48 - 64
		}));

		stage.insert(new Q.Commipoint({
			x: 102 * 48,
			y: 110 * 48 - 64
		}));

		tmxMapSetup(stage);
		checkPointed();
		Q("TheFish").first().p.quick = true;

		stage.on("render", function(ctx) {
			styleRandomColor(ctx);
			ctx.font = "24px 'Press Start 2P'";
			ctx.fillText("CHECKPOINT: " + (checkpoint + 1) + "/22" , 10, 570);
		});

		
		Q.audio.play("CRYSTAL.ogg", {
			loop: true
		});
		lastlevel = "stage_b3";

		alert("** WARNING\nThis is the hardest level in the game. If you somehow reach the end on camera then I think I might owe you something for causing all this sh*t. The level is NOT IMPOSSIBLE and can be played through with skills.")
	});
	
	horseProg.loadthatsecretscene();
}
