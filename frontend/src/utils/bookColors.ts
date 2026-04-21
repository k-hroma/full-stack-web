
const BG_COLORS = [
  '#CDB0EA', '#383838', '#954300','#FF76DC', '#DBD0C1','#C3762A', '#0A9E50', '#7D94A3', 
];

const BG_BORDERS = [
  '#954300','#5CB9FF', '#0A9E50','#C3762A',  '#7D94A3','#FF76DC','#CDB0EA', '#5CB9FF',  
];

const getBookColors = (index: number) => {
  const safeIndex = Math.abs(index) % BG_COLORS.length;
  return {
    bgColor: BG_COLORS[safeIndex],
    borderColor: BG_BORDERS[safeIndex],
  };
}

export { getBookColors };



