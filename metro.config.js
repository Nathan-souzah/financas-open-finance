const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// O SDK Pluggy pode criar diretórios temporários durante a instalação. Eles não
// fazem parte do bundle e não devem ser observados pelo Metro.
config.resolver.blockList = [/node_modules[/\\\\].*_tmp_[/\\\\]/];

module.exports = withNativeWind(config, {
  input: "./global.css",
});
