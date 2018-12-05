// This part is just... badly made...
var horseProg = {
	hits: 0,
	start: function() {
		htop = "";
		this.hits = 0;
		var stage = Q.stage();
		var oldRender = stage.render;
		
		Q.audio.stop();
		Q.audio.play("WL3_43_GOLF.ogg");
		var cutscene = doCutScene({
			pages: ["cs/stg14_0.png", "cs/stg14_1.png", "cs/stg14_2.png", "cs/stg14_3.png",
				"cs/stg14_4.png", "cs/stg14_4.png"
			],
			text: ["blank", "Hey there pony fag im Semantic Airor.",
				"You really need a lot of bits right now; I'll tell you why.",
				"I saw your fish in the blackmarket last month. I used my time machine and went 1 month ahead and I saw Bundle of sticks selling a fish.",
				"You can buy the fish for 200 BITS and I can help you get that!",
				"Lets begin earing bits!"
			]
		}, function() {

			stage.render = oldRender;
			var manehorse = stage.insert(new Q.SpartanBelle({
				x: 1992,
				y: 480,
				maxX: stage._collisionLayers[0].p.w,
				maxY: stage._collisionLayers[0].p.h,
				syncstate: 3
			}));
			stage.viewport.entity.unfollow();
			stage.viewport.centerOn(1992, 312);
			Q.audio.stop();
			Q.audio.play("WL3_44_GOLF.ogg", {
				loop: true
			});

			setTimeout(function() {
				stage.insert(new Q.Cash({
					x: 1992,
					y: 0,
					horse: manehorse
				}));
			}, 2000)
		});
		stage.render = function(ctx) {
			stage.viewport.centerOn(400, 300);
			cutscene.render(ctx);
		};
		console.log(cutscene);
	},
	hit: function(bit) {
		var stage = Q.stage();
		var oldRender = stage.render;
		bits = this.hits * 5;
		if (this.hits == 12 * 2) {
			var cutscene = doCutScene({
				pages: ["cs/stg14_5.png"],
				text: [
					"well... this didn't go as planned... but you still are earning a ton of cash."
				]
			}, function() {
				bit.stopit = false;
				stage.render = oldRender;
				stage.viewport.centerOn(1992, 312);
			});
			bit.stopit = true;
			stage.viewport.centerOn(400, 300);
			stage.render = function(ctx) {
				cutscene.render(ctx);
			};
		} else if (this.hits == 38 * 2) {
			var cutscene = doCutScene({
				pages: ["cs/stg14_6.png"],
				text: ["wow, you're earning so much i can watch this upside down"]
			}, function() {
				bit.stopit = false;
				stage.render = oldRender;
				stage.viewport.centerOn(1992, 312);
			});
			bit.stopit = true;
			stage.viewport.centerOn(400, 300);
			stage.render = function(ctx) {
				cutscene.render(ctx);
			};
		} else if (this.hits == 50 * 2) {
			var cutscene = doCutScene({
				pages: ["cs/stg14_7.png"],
				text: ["So it's either that giant coin is rigged with magnets to cause it to bounce perpetually or is it that physics doesn't exist in this universe. Or maybe this universe just don't exists... I think we might be in a GAME."]
			}, function() {
				bit.stopit = false;
				stage.render = oldRender;
				stage.viewport.centerOn(1992, 312);
			});
			bit.stopit = true;
			stage.viewport.centerOn(400, 300);
			stage.render = function(ctx) {
				cutscene.render(ctx);
			};
		} else if (this.hits == 79 * 2) {
			var cutscene = doCutScene({
				pages: ["cs/stg14_8.png", "cs/stg14_8.png"],
				text: [
					"So how did you get out of this place on the next scene? Did you use noclip(); in the javascript console?",
					"Would you also get a glass of water?"
				]
			}, function() {
				bit.stopit = false;
				stage.render = oldRender;
				stage.viewport.centerOn(1992, 312);
			});
			bit.stopit = true;
			stage.viewport.centerOn(400, 300);
			stage.render = function(ctx) {
				cutscene.render(ctx);
			};
		} else if (this.hits == 101 * 2) {
			var cutscene = doCutScene({
				pages: ["cs/stg14_9.png", "cs/stg14_9.png", "cs/stg14_9.png", "cs/stg14_9.png"],
				text: [
					"There we go, 1010 bits. I'll take 800 for tresspassing and taxes.",
					"I'd also take 10 to get some water.", "BY MYSELF",
					"I got popcorn but no drinks for 5 hours straight"
				]
			}, function() {
				var e = stage.time;
				stage.viewport.centerOn(1992, 312);
				stage.render = function(ctx) {
					ctx.drawImage(Q.asset("back_blank.png"), 0, 0, 800, 600);
					ctx.drawImage(Q.asset("sa_bye.png"), (stage.time - e) * 200, 0, 800, 600);
					Q.ctx.drawImage(Q.asset("coolifier.png"), 0, 0);
				};
				setTimeout(function() { stage.insert(new Q.EndLevel({ horse: Q("SpartanBelle").first() }))}, 4000 / timescale);
				Q.audio.play("drag.ogg", {loop: true});
				bits = 200;
			});
			bit.stopit = true;
			stage.viewport.centerOn(400, 300);
			stage.render = function(ctx) {
				cutscene.render(ctx);
			};
		}
	},
	loadthatsecretscene: function() {
		Q.scene("stage_secret", function(stage) {
			stage.jscare = -1;
			stage.jtime = 0;
			stage.on("render", function(ctx) {
				timescale = 1;
				if (stage.jscare == -1) {
					var spaz = Math.sqrt(Math.pow(Q.inputs.mouseX - 366, 2) + Math.pow(Q.inputs.mouseY - 326, 2));
					spaz = Math.max(400 - spaz, 0) / 90;
					spaz = Math.pow(spaz, 2);
					ctx.drawImage(Q.asset("secret.png"), (Math.random() - 0.5) * spaz, (Math.random() - 0.5) * spaz, 800, 600);
					//ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
					//ctx.fillRect(0, 0, 800, 48);
					//ctx.fillStyle = "rgb(255, 255, 255)";
					//ctx.font = "16px 'Press Start 2P'";
					//ctx.textAlign = "left";
					//ctx.fillText("CLICK NOSE TO CONTINUE.", 10, 15);
					ctx.drawImage(Q.asset("coolifier.png"), 0, 0);
				} else {
					if (stage.jscare % 2 == 0)
						ctx.drawImage(Q.asset("jumpscare.png"), -Math.random() * 50, -Math.random() * 50, 800 + Math.random() * 100, 600 + Math.random() * 100);
					else {
						ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
						ctx.fillRect(0, 0, 800, 600);
					}
					stage.jscare ++;
					if (stage.jtime + Math.PI < stage.time) {
						alert("neat");
						Q.audio.stop();
						checkpoint = -1;
						Q.audio.play("switch.ogg");
						Q.clearStages();
						Q.stageScene("menu");
					}
				}
			});
			var boronthiosulphatenitride = Q.stage().insert(new Q.UI.Button({
				x: 400,
				y: 300,
				w: 800,
				h: 600,
				border: 0,
				radius: 0,
				fill: "rgba(0, 0, 0, 0.3)"
			}));

			boronthiosulphatenitride.on("click", function() {
				if (stage.jscare == -1 && Math.sqrt(Math.pow(Q.inputs.mouseX - 366, 2) + Math.pow(Q.inputs.mouseY - 326, 2)) < 20) {
					Q.audio.play("spooked.ogg", {loop: true});
					Q.audio.play("wootspam.ogg");
					Q.audio.stop("WCTWAITW.ogg");
					stage.jscare = 0;
					stage.jtime = stage.time;
				}
			});

			Q.audio.play("WCTWAITW.ogg", {loop: true})
		});
		
	}
};

var noclip = function() {
	//window.alert(
	//	"this function is suppose to lead to a stage where semantic airor runs and blah blah blah"
	//);
	level("secret");
}
