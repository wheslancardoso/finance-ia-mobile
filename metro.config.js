const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Impede que o Metro suba pastas procurando node_modules (evita pegar o React da raiz)
config.resolver.disableHierarchicalLookup = true;

// Permite que o Metro observe a pasta raiz para importar lógica compartilhada
config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// BLOQUEIA cópias duplicadas do React vindas da raiz (Regex direto para evitar erro de exportação)
config.resolver.blockList = [
  new RegExp(`${workspaceRoot.replace(/[/\\\\]/g, "[/\\\\]")}[/\\\\]node_modules[/\\\\]react[/\\\\].*`),
  new RegExp(`${workspaceRoot.replace(/[/\\\\]/g, "[/\\\\]")}[/\\\\]node_modules[/\\\\]react-dom[/\\\\].*`),
  new RegExp(`${workspaceRoot.replace(/[/\\\\]/g, "[/\\\\]")}[/\\\\]node_modules[/\\\\]@babel[/\\\\]runtime[/\\\\].*`),
];

// FORÇA o uso de uma única cópia do React local
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, "node_modules/react"),
  "react-dom": path.resolve(projectRoot, "node_modules/react-dom"),
  "@babel/runtime": path.resolve(projectRoot, "node_modules/@babel/runtime"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
