pipeline {
    agent any

    stages {
        stage('Hello') {
            steps {
                echo 'Hello World'
            }
        }
        
        stage('List Files') {
            steps {
                sh 'ls -la'
            }
        }

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
