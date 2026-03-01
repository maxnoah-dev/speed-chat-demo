pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    environment {
        SSH_IP = '152.42.173.173'
        SSH_USERNAME = 'root'
        DEPLOY_PATH = '/root/social-full-demo'
        ENV_FILE = '.env.production'
        COMPOSE_FILE = 'docker-compose.yml'
    }

    parameters {
        string(
            name: 'BRANCH',
            defaultValue: 'fe-nginx-demo',
            description: 'Branch to deploy (must exist on remote)'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git rev-parse --short HEAD > git_commit.txt'
                script {
                    env.GIT_COMMIT_SHORT = readFile('git_commit.txt').trim()
                }
            }
        }

        stage('Verify env on server') {
            steps {
                script {
                    def ip = env.SSH_IP
                    def path = env.DEPLOY_PATH
                    def user = env.SSH_USERNAME
                    sshagent(credentials: ['ssh-key']) {
                        sh """
                            ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${user}@${ip} "test -f ${path}/.env.production && test -f ${path}/.env.mysql" || {
                                echo "ERROR: Trên server thiếu file env. Cần tạo:"
                                echo "  - ${path}/.env.production (xem .env.production.example trong repo)"
                                echo "  - ${path}/.env.mysql (MYSQL_ROOT_PASSWORD, MYSQL_DATABASE)"
                                echo "DB_PASSWORD trong .env.production phải trùng MYSQL_ROOT_PASSWORD trong .env.mysql."
                                exit 1
                            }
                        """
                    }
                }
            }
        }

        stage('Deploy to server') {
            steps {
                script {
                    def branch = params.BRANCH ?: env.DEPLOYMENT_GITHUB_BRANCH ?: 'fe-nginx-demo'
                    def remoteCmd = """
                        set -e
                        cd ${env.DEPLOY_PATH}
                        git fetch origin
                        git checkout ${branch}
                        git pull origin ${branch}
                        docker-compose --env-file ${env.ENV_FILE} -f ${env.COMPOSE_FILE} down --remove-orphans || true
                        docker-compose --env-file ${env.ENV_FILE} -f ${env.COMPOSE_FILE} build --no-cache
                        docker-compose --env-file ${env.ENV_FILE} -f ${env.COMPOSE_FILE} up -d
                        docker-compose --env-file ${env.ENV_FILE} -f ${env.COMPOSE_FILE} ps
                    """.stripIndent().trim().replace('\n', ' && ')

                    def ip = env.SSH_IP
                    sshagent(credentials: ['ssh-key']) {
                        sh "ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${env.SSH_USERNAME}@${ip} '${remoteCmd}'"
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Deployed ${params.BRANCH} (${env.GIT_COMMIT_SHORT ?: 'N/A'}) to ${env.SSH_IP}:${env.DEPLOY_PATH}"
        }
        failure {
            echo "Deploy failed. Check logs and server: ssh ${env.SSH_IP}"
        }
        cleanup {
            sh 'rm -f git_commit.txt'
        }
    }
}
