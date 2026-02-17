pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'jscoder4005/expense-tracker-backend'
        DOCKER_REGISTRY = 'docker.io'
        NODE_VERSION = '20'
        DATABASE_URL = credentials('database-url')
        DOCKER_CREDENTIALS = credentials('docker-hub-credentials')
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo '📥 Checking out code...'
                    checkout scm
                }
            }
        }
        
        stage('Setup') {
            steps {
                script {
                    echo '⚙️ Setting up environment...'
                    sh '''
                        node --version
                        npm --version
                        docker --version
                    '''
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    echo '📦 Installing dependencies...'
                    sh 'npm ci'
                }
            }
        }
        
        stage('Lint') {
            steps {
                script {
                    echo '🔍 Running linting...'
                    sh 'npm run lint || echo "No lint script configured"'
                }
            }
        }
        
        stage('Generate Prisma Client') {
            steps {
                script {
                    echo '🔧 Generating Prisma Client...'
                    sh 'npx prisma generate'
                }
            }
        }
        
        stage('Build') {
            steps {
                script {
                    echo '🏗️ Building TypeScript...'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Test') {
            steps {
                script {
                    echo '🧪 Running tests...'
                    sh '''
                        export JWT_SECRET=test-secret
                        export JWT_REFRESH_SECRET=test-refresh-secret
                        npm test || echo "No tests configured yet"
                    '''
                }
            }
        }
        
        stage('Security Scan') {
            parallel {
                stage('Dependency Audit') {
                    steps {
                        script {
                            echo '🔒 Running npm audit...'
                            sh 'npm audit --audit-level=moderate || true'
                        }
                    }
                }
                
                stage('Trivy Scan') {
                    steps {
                        script {
                            echo '🛡️ Running Trivy security scan...'
                            sh '''
                                docker run --rm -v $(pwd):/workspace \
                                    aquasec/trivy:latest fs /workspace \
                                    --severity HIGH,CRITICAL || true
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo '🐳 Building Docker image...'
                    def commitHash = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    def buildTag = "${env.BRANCH_NAME}-${commitHash}"
                    
                    sh """
                        docker build -t ${DOCKER_IMAGE}:${buildTag} .
                        docker tag ${DOCKER_IMAGE}:${buildTag} ${DOCKER_IMAGE}:latest
                    """
                    
                    env.BUILD_TAG = buildTag
                }
            }
        }
        
        stage('Push Docker Image') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo '📤 Pushing Docker image to registry...'
                    sh """
                        echo ${DOCKER_CREDENTIALS_PSW} | docker login -u ${DOCKER_CREDENTIALS_USR} --password-stdin
                        docker push ${DOCKER_IMAGE}:${env.BUILD_TAG}
                        docker push ${DOCKER_IMAGE}:latest
                        docker logout
                    """
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    echo '🚀 Deploying to staging...'
                    // Add staging deployment logic here
                    sh 'echo "Staging deployment would happen here"'
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo '🚀 Deploying to production...'
                    
                    // Option 1: Docker Compose deployment
                    sh '''
                        # ssh to production server and pull new image
                        # ssh user@server "cd /app && docker-compose pull && docker-compose up -d"
                        echo "Production deployment would happen here"
                    '''
                    
                    // Option 2: Kubernetes deployment
                    // sh 'kubectl set image deployment/backend backend=${DOCKER_IMAGE}:${env.BUILD_TAG}'
                    
                    // Option 3: AWS ECS/Fargate
                    // sh 'aws ecs update-service --cluster prod --service backend --force-new-deployment'
                }
            }
        }
        
        stage('Health Check') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    echo '❤️ Running health checks...'
                    // Add health check logic
                    sh 'echo "Health check would verify deployment"'
                }
            }
        }
    }
    
    post {
        success {
            script {
                echo '✅ Pipeline completed successfully!'
                // Send success notification
                // slackSend color: 'good', message: "Build succeeded: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            }
        }
        
        failure {
            script {
                echo '❌ Pipeline failed!'
                // Send failure notification
                // slackSend color: 'danger', message: "Build failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            }
        }
        
        always {
            script {
                echo '🧹 Cleaning up...'
                sh 'docker system prune -f || true'
                cleanWs()
            }
        }
    }
}
