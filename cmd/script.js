const labels = document.querySelectorAll("label");
const inputs = document.querySelectorAll('input[type="radio"]');
const mainElement = document.querySelector("main");
const inputField = document.getElementById("inputField");
const clearButton = document.getElementById("clearButton");

window.addEventListener("DOMContentLoaded", handleDOMContentLoaded);

function handleDOMContentLoaded() {
  handleFontChange();
  handleFontSizeChange();
  inputs.forEach((input) => {
    const storedValue = localStorage.getItem(input.name);
    if (storedValue === input.value) {
      input.checked = true;
    }
  });
  window.removeEventListener("DOMContentLoaded", handleDOMContentLoaded);
}

function clearInput() {
  inputField.value = "";
  clearButton.style.display = "none";
  inputField.focus();
}

if (inputField !== null && clearButton !== null) {
  inputField.addEventListener("input", () => {
    const clearButton = document.getElementById("clearButton");
    if (clearButton !== null) {
      if (inputField.value.trim().length > 0) {
        clearButton.style.display = "block";
      } else {
        clearButton.style.display = "none";
      }
    }
  });

  inputField.addEventListener("keydown", (event) => {
    if (event.code === "Escape") {
      clearInput();
    }
  });

  clearButton.addEventListener("click", () => {
    clearInput();
  });
}

function focusable_children(node) {
  const nodes = Array.from(
    node.querySelectorAll(
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((s) => s.offsetParent !== null);
  const index = nodes.indexOf(document.activeElement);
  const update = (d) => {
    let i = index + d;
    i += nodes.length;
    i %= nodes.length;
    nodes[i].focus();
  };
  return {
    next: (selector) => {
      const reordered = [
        ...nodes.slice(index + 1),
        ...nodes.slice(0, index + 1),
      ];
      for (let i = 0; i < reordered.length; i += 1) {
        if (!selector || reordered[i].matches(selector)) {
          reordered[i].focus();
          return;
        }
      }
    },
    prev: (selector) => {
      const reordered = [
        ...nodes.slice(index + 1),
        ...nodes.slice(0, index + 1),
      ];
      for (let i = reordered.length - 2; i >= 0; i -= 1) {
        if (!selector || reordered[i].matches(selector)) {
          reordered[i].focus();
          return;
        }
      }
    },
    update,
  };
}

function trap(node) {
  const handle_keydown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const group = focusable_children(node);
      if (e.shiftKey) {
        group.prev();
      } else {
        group.next();
      }
    }
  };
  node.addEventListener("keydown", handle_keydown);
  return {
    destroy: () => {
      node.removeEventListener("keydown", handle_keydown);
    },
  };
}

const toggleDropdown = () => {
  const dropdown = document.getElementById("dropdown");
  const dropdown_panel = document.getElementById("dropdown_panel");
  const focusTrap = trap(dropdown);

  const closeDropdown = () => {
    dropdown_panel.classList.add("hidden");
    focusTrap.destroy();
    dropdown.removeEventListener("keydown", handleEscapeKey);
    document.removeEventListener("click", handleClickOutside);
    inputs.forEach((input) => {
      input.removeEventListener("change", handleInputChange);
    });
    labels.forEach((label) => {
      label.removeEventListener("click", handleLabelSelection);
    });
  };

  const handleClickOutside = (e) => {
    if (dropdown !== null && !dropdown.contains(e.target)) {
      closeDropdown();
    }
  };

  const handleEscapeKey = (e) => {
    if (e.key === "Escape") {
      dropdown_panel.classList.add("hidden");
      closeDropdown();
    }
  };

  const handleInputChange = (e) => {
    if (e.target.checked) {
      localStorage.setItem(e.target.name, e.target.value);
      switch (e.target.name) {
        case "theme": {
          handleThemeChange();
          break;
        }
        case "font": {
          handleFontChange();
          break;
        }
        case "fontsize": {
          handleFontSizeChange();
          break;
        }
        default: {
          console.error("Unknown event");
          break;
        }
      }
    }
  };

  const handleLabelSelection = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const input = document.getElementById(e.target.getAttribute("for"));
      input.checked = true;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  if (dropdown_panel.classList.contains("hidden")) {
    dropdown_panel.classList.remove("hidden");
    dropdown.addEventListener("keydown", handleEscapeKey);
    inputs.forEach((input) => {
      input.addEventListener("change", handleInputChange);
    });
    labels.forEach((label) => {
      label.addEventListener("keydown", handleLabelSelection);
    });
    document.addEventListener("click", handleClickOutside);
  } else {
    closeDropdown();
  }
};

const handleFontChange = () => {
  if (mainElement === null) {
    return;
  }
  let font = localStorage.getItem("font");
  if (font === null) {
    localStorage.setItem("font", "sans-serif");
    font = "sans-serif";
  }
  if (font === "serif") {
    mainElement.classList.add("font-serif");
    mainElement.classList.remove("font-sans");
  } else {
    mainElement.classList.add("font-sans");
    mainElement.classList.remove("font-serif");
  }
};

const changeFontSize = (node, classes) => {
  const sizes = [
    "text-xs",
    "text-sm",
    "text-base",
    "text-lg",
    "text-xl",
    "text-2xl",
    "text-3xl",
    "text-4xl",
    "text-5xl",
    "lg:text-4xl",
    "lg:text-5xl",
    "lg:text-6xl",
  ];
  const currentClasses = sizes.filter((size) => node.classList.contains(size));
  node.classList.remove(...currentClasses);
  node.classList.add(...classes);
};

const handleFontSizeChange = () => {
  if (mainElement === null) {
    return;
  }
  let fontSize = localStorage.getItem("fontsize");
  if (fontSize === null) {
    localStorage.setItem("fontsize", "text-base");
    fontSize = "text-base";
  }
  if (fontSize === "text-sm") {
    changeFontSize(document.querySelector("body"), ["text-sm"]);
  } else if (fontSize === "text-lg") {
    changeFontSize(document.querySelector("body"), ["text-lg"]);
  } else {
    changeFontSize(document.querySelector("body"), ["text-base"]);
  }

  const nodes = document.querySelectorAll(
    "h1, h2, h3, h4, h5, h6, code, pre, kbd, table"
  );
  if (fontSize === "text-sm") {
    changeFontSize(mainElement, ["text-sm"]);
  } else if (fontSize === "text-lg") {
    changeFontSize(mainElement, ["text-lg"]);
  } else {
    changeFontSize(mainElement, ["text-base"]);
  }
  nodes.forEach((node) => {
    let classes = "";
    switch (node.tagName) {
      case "H1": {
        if (fontSize === "text-sm") {
          classes = ["text-3xl", "lg:text-4xl"];
        } else if (fontSize === "text-lg") {
          classes = ["text-5xl", "lg:text-6xl"];
        } else {
          classes = ["text-4xl", "lg:text-5xl"];
        }
        break;
      }
      case "H2": {
        if (fontSize === "text-sm") {
          classes = ["text-2xl"];
        } else if (fontSize === "text-lg") {
          classes = ["text-4xl"];
        } else {
          classes = ["text-3xl"];
        }
        break;
      }
      case "H3": {
        if (fontSize === "text-sm") {
          classes = ["text-xl"];
        } else if (fontSize === "text-lg") {
          classes = ["text-3xl"];
        } else {
          classes = ["text-2xl"];
        }
        break;
      }
      case "H4":
      case "H5":
      case "H6": {
        if (fontSize === "text-sm") {
          classes = ["text-lg"];
        } else if (fontSize === "text-lg") {
          classes = ["text-2xl"];
        } else {
          classes = ["text-xl"];
        }
        break;
      }
      case "CODE":
      case "PRE":
      case "KBD":
      case "TABLE": {
        if (fontSize === "text-sm") {
          classes = ["text-xs"];
        } else if (fontSize === "text-lg") {
          classes = ["text-base"];
        } else {
          classes = ["text-sm"];
        }
        break;
      }
      default: {
        if (fontSize === "text-sm") {
          classes = ["text-sm"];
        } else if (fontSize === "text-lg") {
          classes = ["text-lg"];
        } else {
          classes = ["text-base"];
        }
        break;
      }
    }
    changeFontSize(node, classes);
  });
};
