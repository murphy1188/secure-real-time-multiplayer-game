const canWidth = 640;
const canHeight = 480;
const avatarWidth = 110;
const avatarHeight = 110;
const controlInfoBar = 60;
const rankInfoBar = 40;


const canvasCalcs = {
  canWidth: canWidth,
  canHeight: canHeight,
  fieldMinX: 0,
  fieldMaxX: canWidth - avatarWidth,
  fieldMinY: rankInfoBar,
  fieldMaxY: (canHeight - controlInfoBar - avatarHeight),
  fieldWidth: canWidth,
  fieldHeight: canHeight - rankInfoBar - controlInfoBar,
}

const startPosition = (min, max, multiple) => {
  return Math.floor(Math.random() * ((max - min) / multiple)) * multiple + min;
};

export {
  startPosition,
  canvasCalcs
}