// Config barrel file

const config = {
  port: process.env.PORT || 9502,
  nodeEnv: process.env.NODE_ENV || 'development',
  claudeApiKey: process.env.CLAUDE_API_KEY,
  claudeModel: process.env.CLAUDE_MODEL || 'claude-haiku-4-20250514',
  databaseUrl: process.env.DATABASE_URL,
};

module.exports = config;
