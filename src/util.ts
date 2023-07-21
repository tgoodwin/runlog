export function getMonday(d: Date) {
  d = new Date(d)
  var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
  return new Date(d.setDate(diff))
}

export function formatDateStr(dateStr: string) {
  // literal madness: https://stackoverflow.com/a/34821566
  const dateArg = dateStr + " ";

  return new Date(dateArg).toDateString();
}