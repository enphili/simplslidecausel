export const getNavArrows = (prevArrowClass, nextArrowClass, prevIconClass, nextIconClass) => {
  return `
    <div class="${prevArrowClass}"><i class="${prevIconClass}"></i></div>
    <div class="${nextArrowClass}"><i class="${nextIconClass}"></i></div>
  `;
};