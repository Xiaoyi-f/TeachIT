import "./mdEditorConfig";
import { installMermaidPreviewFix } from "./mermaidFix";
import { createApp } from "vue";
import App from "./App.vue";

installMermaidPreviewFix();
createApp(App).mount("#app");
