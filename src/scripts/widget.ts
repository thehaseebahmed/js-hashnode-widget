(function () {
  interface ThaHashnodeWidgetOptions {
    blogUrl: string;
    renderTo: string;
    username: string;
  }

  class ThaHashnodeWidget {
    public async init(options: ThaHashnodeWidgetOptions) {
      const selector: string = options.renderTo ?? "#tha-hashnode-widget";
      const container = document.querySelector(selector);
      if (container == null) {
        console.error(
          "[THA-HW] I could not initialize because you provided an invalid selector."
        );
        return;
      }

      const data = (await this.getFeaturedPosts(options.username)).data;
      if (data == null) {
        console.error(
          "[THA-HW] I was unable to render the widget because something went wrong getting posts from the Hashnode api."
        );
        return;
      }

      const posts = data.user.publication.posts;
      this.injectHtml(container, posts);
      this.injectStyles(options.renderTo);
    }

    private async gql(query: any, variables = {}) {
      const data = await fetch("https://api.hashnode.com/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      return data.json();
    }

    private async getFeaturedPosts(username: string, page: number = 0) {
      const GET_USER_ARTICLES = `
          query GetUserArticles($page: Int!) {
              user(username: \"${username}\") {
                  publication {
                      posts(page: $page) {
                          coverImage
                          title
                      }
                  }
              }
          }
      `;

      return this.gql(GET_USER_ARTICLES, { username, page });
    }

    private injectHtml(element: Element, posts: any) {
      for (const post of posts) {
        const imgContainer = document.createElement("div");
        imgContainer.setAttribute("class", "tha-hashnode-widget__cover-image");

        const img = document.createElement("div");
        img.setAttribute("class", "tha-hashnode-widget__img");
        img.setAttribute(
          "style",
          `background-image: url('${post.coverImage}')`
        );
        imgContainer.appendChild(img);

        const title = document.createElement("div");
        title.setAttribute("class", "tha-hashnode-widget__title");
        title.innerText = post.title;

        const item = document.createElement("div");
        item.setAttribute("class", "tha-hashnode-widget__blog-post");
        item.append(imgContainer);
        item.append(title);
        element?.append(item);
      }
    }

    private injectStyles(selector: string) {
      const styles = `
        ${selector} {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          grid-row-gap: 0.75rem;
          grid-column-gap: 0.5rem;
        }
        
        ${selector} .tha-hashnode-widget__blog-post .tha-hashnode-widget__cover-image .tha-hashnode-widget__img {
            position: absolute;
            background-size: cover;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            height: 100%;
            width: 100%;
        }
        
        ${selector} .tha-hashnode-widget__blog-post .tha-hashnode-widget__cover-image {
          width: 100%;
          padding-top: 56.25%; /* 16:9 Aspect Ratio (divide 9 by 16 = 0.5625) */
          position: relative; /* If you want text inside of it */
        }
        
        ${selector} .tha-hashnode-widget__blog-post .tha-hashnode-widget__title {
          font-weight: bold;
          padding-top: 0.25rem;
        }

        @media (min-width: 640px) {
          ${selector} {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 768px) {
          
        }

        @media (min-width: 1024px) {
          ${selector} {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1280px) { }

        @media (min-width: 1536px) {
          ${selector} {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `;

      const style = document.createElement("style");
      style.setAttribute("type", "text/css");
      style.innerHTML = styles;

      const head = document.querySelector("head");
      if (head == null) {
        console.warn(
          "[THA-HW] I could not inject styles because HTML <head> section was not found."
        );
        return;
      }

      head.appendChild(style);
    }
  }

  (window as any).ThaHashnodeWidget = new ThaHashnodeWidget();
})();
