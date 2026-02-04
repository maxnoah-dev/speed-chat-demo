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
    }
}
