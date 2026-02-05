pipeline {
    agent any

    stages {
        stage('Log Credential') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId:'github-login', usernameVariable:'USER', passwordVariable:'PASS'),
                    sshUserPrivateKey(credentialsId:'ssh-key', keyFileVariable:'KEY',usernameVariable:'USER')
                ]){
                    echo "${USER} - ${PASS} - ${KEY} - ${USER}"
                }
            }
        }
    }
}
