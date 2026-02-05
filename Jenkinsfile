pipeline {
    agent any

    stages {
        stage('Log Credential') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId:'github-login', usernameVariable:'USER-GIT', passwordVariable:'PASS-GIT'),
                    sshUserPrivateKey(credentialsId:'ssh-key', keyFileVariable:'KEY',usernameVariable:'USER')
                ]){
                    echo "${USER-GIT} - ${PASS-GIT} - ${KEY} - ${USER}"
                }
            }
        }
    }
}
