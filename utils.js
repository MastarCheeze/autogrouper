const $ = document.querySelector.bind(document);

function postfix(number) {
  return `${number}${((number - (number % 10)) % 100 !== 10 ? [null, "st", "nd", "rd"][number % 10] : null) ?? "th"}`;
}

const el = {
  log: $("#log"),
  submit: $("#submit"),
  dataInput: $("#data"),
  choiceLabelsInput: $("#choiceLabels"),
  namesItem: $("#names-template"),
  namesContainer: $("#names-container"),
  namesStatus: $("#names-status"),
  groupsItem: $("#groups-template"),
  groupsContainer: $("#groups-container"),
  groupsStatus: $("#groups-status"),
  maxMembersItem: $("#maxMembers-template"),
  maxMembersContainer: $("#maxMembers-container"),
  maxMembersStatus: $("#maxMembers-status"),
}

function logWarning(message) {
  el.log.value += `Warning ${message}\n`;
}

function logError(message) {
  el.log.value += `Error ${message}\n`;
}
 function clearLog() {
  el.log.value = "";
}
