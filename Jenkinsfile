pipeline {
    agent any

    stages {
        stage('Log Credential') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId:'github-login', usernameVariable:'USERGIT', passwordVariable:'PASSGIT'),
                    sshUserPrivateKey(credentialsId:'ssh-key', keyFileVariable:'KEY',usernameVariable:'USER')
                ]){
                    echo "${USERGIT} - ${PASSGIT} - ${KEY} - ${USER}"
                }
            }
        }
    }
}
