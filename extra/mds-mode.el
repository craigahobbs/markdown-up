;;; mds-mode.el --- major mode for editing markdown-script

;; Version: 0.1

;;; Commentary:

;; To install, add the following to your .emacs file:

;; (package-initialize)
;;
;; (unless (package-installed-p 'mds-mode)
;;   (let ((mds-mode-file (make-temp-file "mds-mode")))
;;     (url-copy-file "https://craigahobbs.github.io/markdown-up/extra/mds-mode.el" mds-mode-file t)
;;     (package-install-file mds-mode-file)
;;     (delete-file mds-mode-file)))
;; (add-to-list 'auto-mode-alist '("\\.mds?\\'" . mds-mode))

;;; Code:
(require 'generic-x)

;;;###autoload
(define-generic-mode 'mds-mode
      '("#")
      '(
        "endfunction"
        "false"
        "function"
        "include"
        "jump"
        "jumpif"
        "null"
        "return"
        "true"
        )
      (list
       `("\\('[^']+'\\)" 1 font-lock-string-face)
       (cons
        (regexp-opt
         '(
           "abs"
           "acos"
           "arrayCopy"
           "arrayGet"
           "arrayIndexOf"
           "arrayJoin"
           "arrayLastIndexOf"
           "arrayLength"
           "arrayNew"
           "arrayNewSize"
           "arrayPop"
           "arrayPush"
           "arraySet"
           "arraySlice"
           "asin"
           "atan"
           "atan2"
           "ceil"
           "charCodeAt"
           "cos"
           "date"
           "day"
           "debugLog"
           "documentReset"
           "drawArc"
           "drawCircle"
           "drawClose"
           "drawEllipse"
           "drawHLine"
           "drawLine"
           "drawMove"
           "drawOnClick"
           "drawRect"
           "drawStyle"
           "drawText"
           "drawTextStyle"
           "drawVLine"
           "encodeURIComponent"
           "endsWith"
           "fetch"
           "fixed"
           "floor"
           "fromCharCode"
           "getDrawingHeight"
           "getDrawingWidth"
           "getTextHeight"
           "getTextWidth"
           "getWindowHeight"
           "getWindowWidth"
           "hour"
           "indexOf"
           "jsonParse"
           "jsonStringify"
           "lastIndexOf"
           "len"
           "ln"
           "localStorageClear"
           "localStorageGet"
           "localStorageRemove"
           "localStorageSet"
           "log"
           "log10"
           "lower"
           "markdownEncode"
           "markdownParse"
           "markdownPrint"
           "markdownTitle"
           "max"
           "min"
           "minute"
           "month"
           "now"
           "objectCopy"
           "objectDelete"
           "objectGet"
           "objectKeys"
           "objectNew"
           "objectSet"
           "parseFloat"
           "parseInt"
           "pi"
           "rand"
           "regexEscape"
           "regexMatch"
           "regexNew"
           "regexTest"
           "replace"
           "rept"
           "round"
           "schemaParse"
           "schemaPrint"
           "schemaTypeModel"
           "schemaValidate"
           "schemaValidateTypeModel"
           "second"
           "sessionStorageClear"
           "sessionStorageGet"
           "sessionStorageRemove"
           "sessionStorageSet"
           "setDocumentTitle"
           "setDrawingSize"
           "setWindowLocation"
           "setWindowResize"
           "setWindowTimeout"
           "sign"
           "sin"
           "slice"
           "split"
           "sqrt"
           "startsWith"
           "tan"
           "text"
           "today"
           "trim"
           "typeof"
           "upper"
           "value"
           "year"
           ) 'words) 'font-lock-function-name-face)
        )
      '(".mds\\'")
      nil
      "Major mode for editing markdown-script")

(provide 'mds-mode)
;;; mds-mode.el ends here
