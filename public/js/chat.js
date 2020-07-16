//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const socket = io();
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message,
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (url) => {
  console.log(url);
  const html = Mustache.render(locationTemplate, {
    url,
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //disable the form
  $messageFormButton.setAttribute("disabled", "disabled");

  var form = e.target.elements.messageField;
  socket.emit("sendMessage", form.value, (error) => {
    //enable
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      console.log(error);
    } else {
      console.log("The message was delivered!");
    }
  });
});

document.querySelector("#send-location").addEventListener("click", () => {
  $sendLocationButton.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position);
    coords = {
      longitude: position.coords.longitude,
      latitude: position.coords.latitude,
    };
    socket.emit("sendLocation", coords, (error) => {
      $sendLocationButton.removeAttribute("disabled");
      if (error) {
        console.log("The location couldn't be shared");
      } else {
        console.log("Location shared!");
      }
    });
  });
});
