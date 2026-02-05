pipline {
    agent any

    environment{
        SSH_IP = '188.166.234.37'
        DEPLOY_PATH = '/root/social-full-demo'
        DEPLOYMENT_GITHUB_BRANCH = 'fe-nginx-demo'
    }


    stages{
        stage('Deploy nodejs'){
            withCredentials(
                [sshUserPrivateKey(credentialsId: 'ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]){
                    sh """
                        ssh -o StictHostKeyChecking=no -i ${SSH_KEY} ${SSH_USER}@${SSH_IP}
                        cd ${DEPLOY_PATH} && git pull origin ${DEPLOYMENT_GITHUB_BRANCH}
                        docker-compose down
                        docker-compose build
                        docker-compose up -d
                    """
            }
        }
    }
}