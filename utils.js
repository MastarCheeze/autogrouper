const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function postfix(number) {
  return `${number}${((number - (number % 10)) % 100 !== 10 ? [null, "st", "nd", "rd"][number % 10] : null) ?? "th"}`;
}

const el = {
  log: $("#log"),
  results: $("#results"),
  submit: $("#submit"),
  dataInput: $("#data"),
  choiceLabelsInput: $("#choiceLabels"),
  sameMaxMembersYesInput: $("#sameMaxMembers-yes"),
  sameMaxMembersNoInput: $("#sameMaxMembers-no"),
  maxMembersAllInput: $("#maxMembers-all"),
  maxMembersAllText: $("#maxMembers-all-text"),
  namesItem: $("#names-template"),
  namesContainer: $("#names-container"),
  namesStatus: $("#names-status"),
  groupsItem: $("#groups-template"),
  groupsContainer: $("#groups-container"),
  groupsStatus: $("#groups-status"),
  maxMembersItem: $("#maxMembers-template"),
  maxMembersContainer: $("#maxMembers-container"),
  maxMembersStatus: $("#maxMembers-status"),
  uppercaseInput: $("#uppercase"),
  submitOrderInput: $("#submitOrder"),
  personChoiceInput: $("#personChoice"),
  sortAlphaInput: $("#sortAlpha"),
};

let warningCount = 0;
let errorCount = 0;

function log(message) {
  el.log.value += (message ?? "") + "\n";
}

function logWarning(message) {
  el.log.value += `Warning: ${message}\n`;
  warningCount++;
}

function logError(message) {
  el.log.value += `Error: ${message}\n`;
  errorCount++;
}

function clearLog() {
  el.log.value = "";
  warningCount = 0;
  errorCount = 0;
}

function out(line) {
  el.results.value += (line ?? "") + "\n";
}

function clearOut() {
  el.results.value = "";
}
