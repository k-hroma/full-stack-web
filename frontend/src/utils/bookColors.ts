
const BG_COLORS = [
  '#CDB0EA', '#383838', '#954300', '#DBD0C1', '#0A9E50', '#7D94A3',
];

const BG_BORDERS = [
  '#954300', '#DBD0C1', '#CDB0EA', '#7D94A3', '#DBD0C1', '#0A9E50',
];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const getBookColors = (bookId: string | number) => {
  const index = hashString(String(bookId)) % BG_COLORS.length;
  return {
    bgColor: BG_COLORS[index],
    borderColor: BG_BORDERS[index],
  };
}

export { getBookColors };