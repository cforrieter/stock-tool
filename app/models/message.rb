class Message < ActiveRecord::Base
  validates :author, :content, presence: true

  before_save :validate_url, if: :url

  def validate_url
    unless /https?:\/\//.match(self.url)
      self.url = "http://#{url}"
    end
  end
end