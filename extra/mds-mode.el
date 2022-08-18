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
       `("\\('[^']*'\\)" 1 font-lock-string-face)
        )
      '(".mds\\'")
      nil
      "Major mode for editing markdown-script")

(provide 'mds-mode)
;;; mds-mode.el ends here
