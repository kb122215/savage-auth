// one click listener for every vote and delete button

const messageList = document.querySelector(".messages");

const sendRequest = async (url, method, body) => {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
};

messageList?.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { id } = button.closest(".message").dataset;
  const { action, type } = button.dataset;

  button.disabled = true;

  try {
    if (action === "vote") {
      await sendRequest(`/messages/${id}/vote`, "PUT", { type });
    } else if (action === "delete") {
      await sendRequest(`/messages/${id}`, "DELETE");
    }
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
    button.disabled = false;
  }
});
