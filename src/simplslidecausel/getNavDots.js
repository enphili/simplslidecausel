export const getNavDots = (dotQuantity, dotsClass, dotClass) => {
  let allDots = '';
  for (let i = 0; i < dotQuantity; i++) {
    allDots += `<div class="${dotClass}"></div>`;
  }
  return `
    <div class="${dotsClass}">
      ${allDots}
    </div>
  `;
};