#!/usr/bin/env bash

set -e

TIMESTAMP=$(date +%s)

# Install and setup kubectl
HOST=$PROD_HOST
echo "$PROD_CA_CERT" | base64 -i --decode > ca.pem
echo "$PROD_ADMIN_KEY" | base64 -i --decode > admin-key.pem
echo "$PROD_ADMIN_CERT" | base64 -i --decode > admin.pem
curl -O https://storage.googleapis.com/kubernetes-release/release/v1.6.1/bin/linux/amd64/kubectl
chmod +x kubectl
./kubectl config set-cluster default-cluster --server=https://"$HOST" --certificate-authority=ca.pem
./kubectl config set-credentials default-admin --certificate-authority=ca.pem --client-key=admin-key.pem --client-certificate=admin.pem
./kubectl config set-context default-system --cluster=default-cluster --user=default-admin
./kubectl config use-context default-system

# Login to Docker Hub
docker login -u "$DOCKER_USER" -p "$DOCKER_PASS" -e "$DOCKER_EMAIL"

# Build and push
# INT
docker build --rm=false -t coderdojo/coolest-platform:"${GIT_SHA1}-${TIMESTAMP}" --build-arg "EVENT_SLUG=int-2019" --build-arg "GOOGLE_ANALYTICS_PROPERTY_ID=UA-112027238-2" .
docker push coderdojo/coolest-platform:"${GIT_SHA1}-${TIMESTAMP}"
./kubectl --namespace=coolest-namespace patch deployment coolest-platform -p '{"spec":{"template":{"spec":{"containers":[{"name":"coolest-platform","image":"coderdojo/coolest-platform:'"${GIT_SHA1}-${TIMESTAMP}"'"}]}}}}'
# USA
docker build --rm=false -t coderdojo/coolest-platform:usa -t coderdojo/coolest-platform:usa-"${GIT_SHA1}-${TIMESTAMP}" --build-arg "EVENT_SLUG=usa-2019" --build-arg "GOOGLE_ANALYTICS_PROPERTY_ID=UA-112027238-4" .
docker push coderdojo/coolest-platform:usa
docker push coderdojo/coolest-platform:usa-"${GIT_SHA1}-${TIMESTAMP}"
./kubectl --namespace=coolest-namespace-usa patch deployment coolest-platform -p '{"spec":{"template":{"spec":{"containers":[{"name":"coolest-platform","image":"coderdojo/coolest-platform:'usa-"${GIT_SHA1}-${TIMESTAMP}"'"}]}}}}'
# UK
docker build --rm=false -t coderdojo/coolest-platform:uk -t coderdojo/coolest-platform:uk-"${GIT_SHA1}-${TIMESTAMP}" --build-arg "EVENT_SLUG=uk-2019" --build-arg "GOOGLE_ANALYTICS_PROPERTY_ID=UA-112027238-5" .
docker push coderdojo/coolest-platform:uk
docker push coderdojo/coolest-platform:uk-"${GIT_SHA1}-${TIMESTAMP}"
./kubectl --namespace=coolest-namespace-uk patch deployment coolest-platform -p '{"spec":{"template":{"spec":{"containers":[{"name":"coolest-platform","image":"coderdojo/coolest-platform:'uk-"${GIT_SHA1}-${TIMESTAMP}"'"}]}}}}'
