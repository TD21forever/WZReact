function createElement(type, props, ...children) {
  let element = {
    type: type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === "object" ? child : createTextElement(child);
      }),
    },
  };
  return element;
}

function createTextElement(text) {
  let element = {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
  return element;
}

let nextUnitOfWork = null;
let currentRoot = null; // 存储的是上一次任务的Fiber Node
let deletions = null;
let wipRoot = null;

// 目的: 把element渲染到container中
function render(element, container) {
  console.log(element);
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    parent: null,
    child: null,
    sibling: null,
    //
    alternate: currentRoot,
  };
  nextUnitOfWork = wipRoot;
  deletions = [];
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

// 把当前fiber节点转成dom
function createDom(fiber) {
  let dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);
  updateDom(dom, {}, fiber.props);
  return dom;
}

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {
  // fiber to DOM
  if (!fiber.dom) fiber.dom = createDom(fiber);
  // fiber children element to Fiber
  let elements = fiber.props.children;
  reconcileChildren(fiber, elements);
}

function performUnitOfWork(fiber) {

  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }
  // return next fiber
  if (fiber.child) return fiber.child;
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
}

function commitRoot() {
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function updateDom(dom, prevProps, nextProps) {
  const isEvent = (key) => key.startsWith("on");
  const isGone = (prev, next) => (key) => !(key in next);
  const isProperty = (key) => key !== "children" && !isEvent(key);
  const isNew = (prev, next) => (key) => prev[key] !== next[key];
  // Equal To:
  // function isNew(prev, next) {
  //   return function(key) {
  //     return prev[key] !== next[key];
  //   }
  // }

  // 对于Listener, 删除没有出现过的以及和新出现的不相同的
  // 删除
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      (key) =>
        isGone(prevProps, nextProps)(key) || isNew(prevProps, nextProps)(key)
    )
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });
  // 新增
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });

  // 对于其他property
  // 删除不存在的Props
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = "";
    });
  // 简单替换即可
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom;
  switch (fiber.effectTag) {
    case "PLACEMENT":
      if (fiber.dom) domParent.appendChild(fiber.dom);
      break;
    case "UPDATE":
      if (fiber.dom) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props);
      }
      break;
    case "DELETION":
      commitDeletion(fiber, domParentFiber)
      break;
    default:
      break;
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, fiberParent){
  if(fiber.dom){
    fiberParent.dom.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, fiberParent)
  }
}

// // DIFF,处理节点的更新操作
// 这里的参数,fiber是当前节点,而elements是当前节点的孩子
function reconcileChildren(fiber, elements) {
  let index = 0;
  let oldFiber = fiber.alternate && fiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;
    const sameType = oldFiber && element && element.type === oldFiber.type;

    // 类型相同, 保持DOM
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: fiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }
    // 类型不同, 创建新元素
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: fiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }
    // 类型不同, 删除旧元素
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) oldFiber = oldFiber.sibling;
    
    if (index === 0) {
        fiber.child = newFiber
    } else if (element) {
        prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
}

const WZReact = {
    createElement,
    render
}
export default WZReact;


