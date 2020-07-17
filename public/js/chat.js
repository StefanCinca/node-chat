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
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options

const autoScroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  //Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  console.log(newMessageMargin);
  console.log(newMessageHeight);

  //Visible height
  const visibleHeight = $messages.offsetHeight;

  //Height of messages container
  const containerHeight = $messages.scrollHeight;

  //How far have i scrolled

  const scrollOffset = ($messages.scrollTop + visibleHeight) * 2;

  if (containerHeight - newMessageHeight < scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (locationMessage) => {
  console.log(locationMessage.url);
  const html = Mustache.render(locationTemplate, {
    username: locationMessage.username,
    url: locationMessage.url,
    createdAt: moment(locationMessage.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").insertAdjacentHTML("beforeend", html);
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

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
