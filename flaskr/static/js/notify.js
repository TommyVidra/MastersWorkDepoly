// const successBtn = document.querySelector(".buttons__success");
// const errorBtn = document.querySelector(".buttons__error");

class Notification {
  addNotification(settings) {
    this.type = settings.type;
    this.title = settings.title;
    this.message = settings.message;

    let icon;
    let divClass;
    let textColor;

    //Change the color and icon on your notification
    if (this.type == "success") {
      icon = "fa fa-check";
      divClass = "success";
      textColor = "#64963b";
    } else if (this.type == "error") {
      icon = "fa fa-times";
      divClass = "error";
      textColor = "#963b3b";
    }

    let notificationContent = `
      <div class="notification__icon">
        <i class="${icon}" aria-hidden="true" style="color: ${textColor}"></i>
      </div>
      <div class="notification__exit-icon" id="close-div">
        <i class="fa fa-times-circle" aria-hidden="true"></i>
      </div>
      <div class="notification__content">
        <h1 class="notification-title" style="color: ${textColor}">${
      this.title
    }</h1>
        <p class="notification-message">${this.message}</p>
      </div>`;

    let notifyArea = document.createElement("div");
    notifyArea.classList.add("notification-area");

    let notification = document.createElement("div");
    notification.classList.add("notification");
    notification.innerHTML = notificationContent;

    const area = document.querySelector(".notification-area");

    let firstTimer;
    let secondTimer;

    if (!area) {
      document.body.appendChild(notifyArea);
      notifyArea.appendChild(notification);

      if (!notification) {
        clearTimeout(firstTimer);
      } else if (notification) {
        firstTimer = setTimeout(() => {
          notification.remove();
        }, 1000);
      }
    } else {
      area.appendChild(notification);

      if (!notification) {
        clearTimeout(secondTimer);
      } else {
        secondTimer = setTimeout(function() {
          notification.remove();
        }, 1000);
      }
    }
    $("#close-div").on('click', () => {
      $(".notification").remove()
    })
  }
}

// let notify = new Notification();

// /* ----- Specify type of notification, title and message ----- */

// successBtn.addEventListener("click", () => {
//   notify.addNotification({
//     type: "success",
//     title: "Success!",
//     message: "Your notification is working!"
//   });
// });

// errorBtn.addEventListener("click", () => {
//   notify.addNotification({
//     type: "error",
//     title: "Error!",
//     message: "Please try again!"
//   });
// });
