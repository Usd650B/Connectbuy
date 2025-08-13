import * as React from "react"

type ToastType = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

type ToastActionType = {
  type: "ADD_TOAST" | "REMOVE_TOAST"
  toast: ToastType
}

interface State {
  toasts: ToastType[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toast: { id: toastId },
    })
  }, 5000)

  toastTimeouts.set(toastId, timeout)
}

export const toastReducer = (state: State, action: ToastActionType): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, 5),
      }

    case "REMOVE_TOAST":
      if (action.toast.id === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toast.id),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: ToastActionType) {
  memoryState = toastReducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToastType, "id">

function toast({ ...props }: Toast) {
  const id = Math.random().toString(36).substring(2, 9)

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
    },
  })

  addToRemoveQueue(id)

  return {
    id,
    dismiss: () => dispatch({ type: "REMOVE_TOAST", toast: { id } }),
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => {
      if (!toastId) return;
      dispatch({ type: "REMOVE_TOAST", toast: { id: toastId } });
    },
  }
}

export { useToast, toast }
