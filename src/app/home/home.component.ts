/*!
 * Copyright (c) 2018, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Inject } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

interface ResourceServerExample {
  label: string;
  url: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  resourceServerExamples: Array<ResourceServerExample>;
  userName: string = '';
  isAuthenticated: boolean = false;
  error: Error | null = null;

  constructor(
    @Inject(OKTA_AUTH) public oktaAuth: OktaAuth,
    private http: HttpClient
  ) {
    this.resourceServerExamples = [
      {
        label: 'Node/Express Resource Server Example',
        url: 'https://github.com/okta/samples-nodejs-express-4/tree/master/resource-server',
      },
      {
        label: 'Java/Spring MVC Resource Server Example',
        url: 'https://github.com/okta/samples-java-spring-mvc/tree/master/resource-server',
      },
    ];
  }

  async login() {
    try {
      await this.oktaAuth.signInWithRedirect({ originalUri: '/' });
    } catch (err) {
      console.error(err);
      this.error = err as Error;
    }
  }
  async logout(){
    await this.oktaAuth.signOut();
  }

  async ngOnInit() {
    this.isAuthenticated = await this.oktaAuth.isAuthenticated();
    console.log(this.oktaAuth.getUser());
    if (this.isAuthenticated) {
      const userClaims = await this.oktaAuth.getUser();
      this.http
        .post(
          'http://localhost:9000/home',
          {
            name: userClaims.name,
            locale: userClaims.locale,
            email: userClaims.email,
            username: userClaims.preferred_username,
            givenName: userClaims.given_name,
            familyName: userClaims.family_name,
            isEmailVerified: userClaims.email_verified,
          },
          {
            headers: {
              Authorization: 'Bearer ' + this.oktaAuth.getAccessToken(),
            },
          }
        )
        .subscribe((data) => {
          console.log(data);
        });
      this.userName = userClaims.name as string;
    }
  }
}
