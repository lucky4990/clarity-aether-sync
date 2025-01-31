;; AetherSync Contract

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-authorized (err u100))
(define-constant err-channel-exists (err u101))
(define-constant err-invalid-channel (err u102))

;; Data vars
(define-map channels 
  { channel-id: uint }
  {
    owner: principal,
    participant: principal,
    created-at: uint,
    status: (string-ascii 10)
  }
)

(define-map updates
  { channel-id: uint, update-id: uint }
  {
    data-hash: (buff 32),
    merkle-root: (buff 32),
    timestamp: uint,
    author: principal
  }
)

(define-data-var next-channel-id uint u1)
(define-data-var next-update-id uint u1)

;; Public functions
(define-public (create-channel (participant principal))
  (let ((channel-id (var-get next-channel-id)))
    (if (is-some (map-get? channels {channel-id: channel-id}))
      err-channel-exists
      (begin
        (map-set channels
          {channel-id: channel-id}
          {
            owner: tx-sender,
            participant: participant,
            created-at: block-height,
            status: "active"
          }
        )
        (var-set next-channel-id (+ channel-id u1))
        (ok channel-id)))))

(define-public (post-update (channel-id uint) (data-hash (buff 32)) (merkle-root (buff 32)))
  (let ((channel (map-get? channels {channel-id: channel-id}))
        (update-id (var-get next-update-id)))
    (if (and
          (is-some channel)
          (or
            (is-eq tx-sender (get owner (unwrap-panic channel)))
            (is-eq tx-sender (get participant (unwrap-panic channel)))
          ))
      (begin
        (map-set updates
          {channel-id: channel-id, update-id: update-id}
          {
            data-hash: data-hash,
            merkle-root: merkle-root,
            timestamp: block-height,
            author: tx-sender
          }
        )
        (var-set next-update-id (+ update-id u1))
        (ok update-id))
      err-not-authorized)))

;; Read only functions
(define-read-only (get-channel (channel-id uint))
  (ok (map-get? channels {channel-id: channel-id})))

(define-read-only (get-update (channel-id uint) (update-id uint))
  (ok (map-get? updates {channel-id: channel-id, update-id: update-id})))
