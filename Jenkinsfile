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
                [sshUserPrivateKey(credentialsId: 'ssh-key', keyFileVariable: 'SSHKEY', usernameVariable: 'SSHUSER')]){
                    sh """
                        ssh -o StictHostKeyChecking=no -i ${SSHKEY} ${SSHUSER}@${SSH_IP} '
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