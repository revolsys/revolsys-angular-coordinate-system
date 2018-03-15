node ('master'){
  stage ('Deploy') {
    checkout scm
    sh 'npm install'
    sh 'npm run deploy-gh-pages'
  }
}
