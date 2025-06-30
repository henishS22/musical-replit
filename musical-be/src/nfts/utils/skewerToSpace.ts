function skewerToSpace(str) {
  return str.replace(/-+/g, ' ').replace(/([a-z])-([a-z0-9])/gi, '$1 $2');
}

export default skewerToSpace;
