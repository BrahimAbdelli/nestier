const axios = require('axios');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const SONARQUBE_URL = 'http://localhost:9000';
const PROJECT_KEY = 'nestier';
const PROJECT_NAME = 'Nestier';
const TOKEN_NAME = 'nestier-auto-token';
const MAX_WAIT_TIME = 60;
const POLL_INTERVAL = 2000;

class SonarQubeSetup {
  constructor() {
    this.authHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from('admin:admin').toString('base64')
    };
  }

  async waitForSonarQube() {
    console.log('Waiting for SonarQube to be ready...');

    for (let i = 0; i < MAX_WAIT_TIME; i++) {
      try {
        const response = await axios.get(`${SONARQUBE_URL}/api/system/status`);
        if (response.data.status === 'UP') {
          console.log('SonarQube is ready');
          return true;
        }
      } catch (_error) {
        console.error('Error checking SonarQube status:', _error.message);
      }
      await this.sleep(POLL_INTERVAL);
    }

    throw new Error('SonarQube did not start within 2 minutes');
  }

  async createProject() {
    console.log('Creating project...');

    try {
      await axios.post(
        `${SONARQUBE_URL}/api/projects/create`,
        `project=${PROJECT_KEY}&name=${PROJECT_NAME}`,
        { headers: this.authHeaders }
      );
      console.log('Project created successfully');
      return true;
    } catch (error) {
      if (this.isProjectAlreadyExistsError(error)) {
        console.log('Project already exists, continuing...');
        return true;
      }
      throw new Error(`Project creation failed: ${this.getErrorMessage(error)}`);
    }
  }

  async generateToken() {
    console.log('Generating token...');

    try {
      await this.revokeExistingToken();
      const token = await this.createNewToken();
      console.log('Token generated successfully');
      return token;
    } catch (error) {
      throw new Error(`Token generation failed: ${this.getErrorMessage(error)}`);
    }
  }

  async revokeExistingToken() {
    try {
      await axios.post(
        `${SONARQUBE_URL}/api/user_tokens/revoke`,
        `name=${TOKEN_NAME}`,
        { headers: this.authHeaders }
      );
      console.log('Removed existing token');
    } catch (_error) {
      console.error('Error revoking existing token:', _error.message);
    }
  }

  async createNewToken() {
    const response = await axios.post(
      `${SONARQUBE_URL}/api/user_tokens/generate`,
      `name=${TOKEN_NAME}`,
      { headers: this.authHeaders }
    );
    return response.data.token;
  }

  async updateSonarConfig(token) {
    console.log('Updating sonar-project.properties...');
    try {
      const configPath = path.join(__dirname, '..', 'sonar-project.properties');
      let config = fs.readFileSync(configPath, 'utf8');

      config = this.cleanAuthenticationLines(config);
      config = this.addTokenAuthentication(config, token);

      fs.writeFileSync(configPath, config);
      console.log('Configuration updated');
    } catch (error) {
      console.error('Error updating sonar-project.properties:', error.message);
      throw error;
    }
  }

  cleanAuthenticationLines(config) {
    return config
      .replace(/# Authentication.*\n.*\n.*\n/g, '')
      .replace(/sonar\.login=.*\n/g, '')
      .replace(/sonar\.password=.*\n/g, '')
      .replace(/sonar\.token=.*\n/g, '');
  }

  addTokenAuthentication(config, token) {
    return config.replace(
      /(# SonarQube Configuration for NestJS Project)/,
      `$1\n\n# Authentication\nsonar.token=${token}`
    );
  }

  async updateVSCodeConfig(token) {
    console.log('Updating VS Code settings...');

    try {
      const vscodePath = path.join(__dirname, '..', '.vscode', 'settings.json');
      const settings = {
        "sonarlint.connectedMode.servers": [
          {
            "serverId": "nestier-local",
            "serverUrl": SONARQUBE_URL,
            "token": token
          }
        ],
        "sonarlint.connectedMode.project": {
          "projectKey": PROJECT_KEY
        }
      };

      fs.writeFileSync(vscodePath, JSON.stringify(settings, null, 2));
      console.log('VS Code settings updated');
    } catch (error) {
      console.error('Error updating VS Code settings:', error.message);
      throw error;
    }
  }

  async runAnalysis() {
    console.log('Running SonarQube analysis...');

    try {
      execSync('npm run sonar', {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      console.log('Analysis completed successfully');
    } catch (error) {
      console.error('Analysis failed:', error.message);
      throw error;
    }
  }

  async execute() {
    try {
      console.log('Starting SonarQube setup...\n');

      await this.waitForSonarQube();
      await this.createProject();

      const token = await this.generateToken();

      await this.updateSonarConfig(token);
      await this.updateVSCodeConfig(token);
      await this.runAnalysis();

      console.log('\nSonarQube setup completed successfully');
      console.log('View results at: http://localhost:9000');
      console.log('VS Code extension is configured with the token');
      console.log(`Token: ${token}`);

    } catch (error) {
      console.error('\nSetup failed:', error.message);
      process.exit(1);
    }
  }

  isProjectAlreadyExistsError(error) {
    return error.response?.status === 400 &&
      error.response.data?.errors?.[0]?.msg?.includes('already exists');
  }

  getErrorMessage(error) {
    return error.response?.data?.message || error.message;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

async function main() {
  const setup = new SonarQubeSetup();
  await setup.execute();
}

if (require.main === module) {
  main();
}

module.exports = { SonarQubeSetup, main };
