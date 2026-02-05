pipeline {
    agent any

    environment{
        SSH_IP = '188.166.234.37'
        DEPLOY_PATH = '/root/social-full-demo'
        DEPLOYMENT_GITHUB_BRANCH = 'fe-nginx-demo'
    }

    stages{
        stage('Deploy nodejs'){
            steps {
                withCredentials(
                    [sshUserPrivateKey(credentialsId: 'ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]
                    ){
                        sh """
                                ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} ${SSH_USER}@${SSH_IP} '
                                cd ${DEPLOY_PATH} && git pull origin ${DEPLOYMENT_GITHUB_BRANCH}
                                docker-compose down
                                docker-compose build
                                docker-compose up -d
                        '
                        """
                }
            }
        }
    }
}