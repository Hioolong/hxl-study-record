const listData = [
	"111111111111111111111",
	"22222222222222222222222222",
	"33333333333333333",
	"44444444444444",
	"555555555555555555",
	"666666666666666",
];

(() => {
	const wrapper = document.querySelector(".draggable-list-wrapper");

	const init = () => {
		render();
		bindEvent();
	};

	function render() {
		const oList = createList();
		wrapper.appendChild(oList);
	}

	function bindEvent() {
		const oDraggableList = document.querySelector(".draggable-list");
		const oDraggableItems = document.querySelectorAll(".draggable-item");

    oDraggableList.addEventListener("dragover", handleDragOver, false)

		oDraggableItems.forEach((item) => {
			item.addEventListener("dragstart", handleDragStart, false);
			item.addEventListener("dragend", handleDragEnd, false);
		});
	}

	function handleDragStart() {
		const item = this;
		setTimeout(() => {
			item.classList.add("dragging");
		});
	}

	function handleDragOver(e) {
    // 判断移动的位置
    const oDraggableList = this;
    const draggingItem = document.querySelector(".dragging")
    const sibItems = document.querySelectorAll('.draggable-item:not(.dragging)');
    // 找出距离被拖拽元素最近元素的临界点
    const targetItem = [...sibItems].find((item) => {
      return e.clientY <= item.offsetTop + (item.offsetHeight / 2)
    })

    oDraggableList.insertBefore(draggingItem, targetItem)
  }

	function handleDragEnd() {
		const item = this;
		item.classList.remove("dragging");
	}

	function createList() {
		const oDraggableList = document.createElement("ul");
		oDraggableList.classList.add("draggable-list");

		listData.forEach((item) => {
			const oDraggableItem = document.createElement("li");
			oDraggableItem.classList.add("draggable-item");
			oDraggableItem.draggable = true;
			oDraggableItem.innerHTML = `<p>${item}</p>`;
			oDraggableList.appendChild(oDraggableItem);
		});

		return oDraggableList;
	}

	init();
})();
