(define-non-fungible-token rewards int)

(define-map user-contribution ((user principal)) ((points int)))


;; Create Reward
(define-private (create-reward (user principal) (reward-name int))
  (begin
    (nft-mint? rewards reward-name user)
    (ok true)
  ))


;; No Reward
(define-private (no-reward)
   (ok false)
)


;; Get user points public
(define-public (get-user-points (user principal))
  (begin
    (ok (get-user-points-private user))))


;; Get user points private
(define-private (get-user-points-private (user principal))
  (begin
   (default-to 0 (get points (map-get? user-contribution ((user user)))))
  ))


;; Sample Dapp event which increases the user's points. It rewards user with nft when certain milestones are reached
(define-public (sample-event (uuid int))
  (let ((updated-points (+ 1 (get-user-points-private tx-sender))))
  (map-set user-contribution ((user tx-sender)) ((points updated-points)))
  (if (is-eq updated-points 3)
    (create-reward tx-sender uuid)
    (no-reward)
  )
  (ok updated-points)
  ))


;; Get the owner of the specified nft uuid
(define-public (owner-of (uuid int))
  (ok (nft-get-owner? rewards uuid))
)


