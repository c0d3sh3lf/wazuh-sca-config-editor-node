pipeline {
  environment {
    recepientEmail = "sumit.shrivastava65@gmail.com"
    dockerCredentialsId = 'docker-hub'
    imageName = 'invad3rsam/wazuh-sca-config-editor-node:latest'
  }
  agent any
  stages {
    stage('Checkout Source') {
      steps {
        checkout scm: [$class: 'GitSCM',
        branches: [[name: '*/development']],
        userRemoteConfigs: [[credentialsId: 'github-fa-token', 
        url: 'https://github.com/c0d3sh3lf/wazuh-sca-config-editor-node']]]
      }
    }
    stage('Building Image') {
        steps {
            script {
                //Login to docker hub
                docker.withRegistry('https://index.docker.io/v1/', dockerCredentialsId) {
                    // Build the Docker image
                    def customImage = docker.build(imageName)
                    // Push the image to Docker Hub
                    customImage.push()
                }
            }
        }
    }
    stage('Deploy the app on cluster') {
      steps {
        script {
          sh 'kubectl apply -f namespace.yaml'
          sh 'kubectl apply -f deployment.yaml'
          sh 'kubectl apply -f service.yaml'
        }
      }
    }
  }
  post {
    always {
      emailext to: "${recepientEmail}",
      from: 'Jenkins (noreply.jenkins.sam@gmail.com)',
      subject: "Jenkins Build ${currentBuild.currentResult}: ${env.JOB_NAME}: #${currentBuild.number}",
      body: "${currentBuild.currentResult}: Job ${env.JOB_NAME}\nMore Info can be found here: ${env.BUILD_URL}",
      mimeType: 'text/html',
      attachLog: true // Attach the build log to the email
      script {
            // Clean up Docker images to avoid filling up space on the agent
            sh "docker rmi \$(docker images -q ${imageName})"
        }
    }
    success {
      script {
        sh "curl -H \"Title: ${currentBuild.currentResult} - ${env.JOB_NAME} #${currentBuild.number}\" -H \"Tags: green_circle\" -d \"${currentBuild.currentResult} for jenkins job ${env.JOB_NAME} for build number ${currentBuild.number}. More info at ${env.BUILD_URL}.\" -k https://ntfy.invadersam.cloud/sam_alerts"
      }
    }
    failure {
      script {
        sh "curl -H \"Title: ${currentBuild.currentResult} - ${env.JOB_NAME} #${currentBuild.number}\" -H \"Tags: red_circle\" -d \"${currentBuild.currentResult} for jenkins job ${env.JOB_NAME} for build number ${currentBuild.number}. More info at ${env.BUILD_URL}.\" -k https://ntfy.invadersam.cloud/sam_alerts"
      }
    }
  }
}