import "./commands";

// Ignora erros do Speech Recognition (não disponível em ambiente CI headless)
Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("SpeechRecognition") || err.message.includes("webkitSpeechRecognition")) {
    return false;
  }
});
