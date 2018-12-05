Q.scene("stage_1", function(stage) {

  Q.stageTMX("stage_1.tmx", stage);
  openHtop();

  stage.on("prerender", function(ctx) {
    tileBack(ctx, stage, "sky_wall.png", 0, 0, 0.8, 0.8, 512, 512);
  });

  stage.insert(new Q.Commipoint({
    x: 4 * 48,
    y: 8 * 48 - 64
  }));

  tmxMapSetup(stage);
  checkPointed();

  Q.audio.play("STARTFISH.ogg", {
    loop: true
  });
  lastlevel = "stage_1";
});
