/*
 * tutorial.js
 * Self explanatory
 */

var loadTutorial = function() {
	Q.scene("stage_tutorial", function(stage) {
		Q.stageTMX("stage_8.tmx", stage);
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
	});

}